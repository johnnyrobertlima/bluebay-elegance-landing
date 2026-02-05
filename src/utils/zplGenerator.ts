import { LabelElement, LabelLayout } from "@/service/bluebay_adm/labelLayoutService";

const DEFAULT_DPI = 203;

const mmToDots = (mm: number, dpi: number): number => Math.round(mm * (dpi / 25.4));

const cleanText = (text: string): string => {
    // Basic cleanup, replace accents if needed, though CI28 handles UTF-8
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const replacePlaceholders = (text: string, data: any): string => {
    return text.replace(/\{(\w+)\}/g, (_, key) => {
        // defined check
        if (data[key] !== undefined) return String(data[key]);

        // case-insensitive check
        const lowerKey = key.toLowerCase();
        const foundKey = Object.keys(data).find(k => k.toLowerCase() === lowerKey);
        if (foundKey && data[foundKey] !== undefined) return String(data[foundKey]);

        return '';
    });
};

// ... imports and helpers ...

const imageToZPLHex = async (imageUrl: string, widthDots: number, heightDots: number, rotation: number = 0): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // If rotated 90 or 270, swap canvas dimensions
            const isVertical = Math.abs(rotation % 180) === 90;
            const finalW = isVertical ? heightDots : widthDots;
            const finalH = isVertical ? widthDots : heightDots;

            canvas.width = finalW;
            canvas.height = finalH;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve('');
                return;
            }

            // Fill white background first (avoid transparency issues)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Handle Rotation
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(img, -widthDots / 2, -heightDots / 2, widthDots, heightDots);
            ctx.restore();

            const imgData = ctx.getImageData(0, 0, finalW, finalH);
            const data = imgData.data;
            // ... processing loop below needs to use finalW/finalH

            let hexString = '';
            let byte = 0;
            let bitCount = 0;

            // ZPL expects row by row data
            const bytesPerRow = Math.ceil(finalW / 8);
            let totalBytes = 0;

            for (let y = 0; y < finalH; y++) {
                for (let x = 0; x < finalW; x++) {
                    const idx = (y * finalW + x) * 4;
                    // RGB to Grayscale (Luminance)
                    const avg = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
                    // Threshold (Black if < 128)
                    const isBlack = avg < 128;

                    if (isBlack) {
                        byte |= (1 << (7 - bitCount)); // Set correct bit for black
                    }

                    bitCount++;

                    if (bitCount === 8) {
                        hexString += byte.toString(16).padStart(2, '0').toUpperCase();
                        byte = 0;
                        bitCount = 0;
                        totalBytes++;
                    }
                }
                // Pad end of row if width is not multiple of 8
                if (bitCount > 0) {
                    hexString += byte.toString(16).padStart(2, '0').toUpperCase();
                    byte = 0;
                    bitCount = 0;
                    totalBytes++;
                }

                // ZPL might need explicit newlines or simpler flow. 
                // Using ^GFA default linear flow.
            }

            // Build command
            // ^GFA,b,c,d,data
            // a = compression type (A=Ascii) - implicit in command usually if omitting param? No, command is ^GFA
            // ^GFA<compression_type>,<binary_byte_count>,<graphic_field_count>,<bytes_per_row>,<data>
            // Actually it's ^GFA, <binary_byte_count>, <total_bytes>, <bytes_per_row>, <data>
            // where data is hex string.

            const command = `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hexString}`;
            resolve(command);
        };
        img.onerror = (err) => {
            console.error("Error loading image for ZPL", err);
            resolve(''); // Skip image on error
        };
        img.src = imageUrl;
    });
};

export const generateZPL = async (layout: LabelLayout, dataList: any[], options: ZPLOptions | number = DEFAULT_DPI): Promise<string> => {
    // Backwards compatibility if user passes just number
    const dpi = typeof options === 'number' ? options : options.dpi || DEFAULT_DPI;
    const offsetLeftMm = typeof options === 'object' ? options.offsetLeft || 0 : 0;
    const offsetTopMm = typeof options === 'object' ? options.offsetTop || 0 : 0;

    const offsetLeftDots = mmToDots(offsetLeftMm, dpi);
    const offsetTopDots = mmToDots(offsetTopMm, dpi);

    // Dynamic Label Size
    const labelWidthDots = mmToDots(layout.width || 86, dpi);
    const labelHeightDots = mmToDots(layout.height || 120, dpi);

    let zpl = '';

    for (const data of dataList) {
        // Label Start
        zpl += '^XA';
        zpl += '^CI28'; // UTF-8 Encoding
        zpl += `^PW${labelWidthDots}`;
        zpl += `^LL${labelHeightDots}`;
        zpl += '^MNY^MMT'; // Tear-off
        zpl += '^LH0,0';

        // Custom ZT411 Calibration for RFID if needed?
        // ^RS8 = Tag Type Gen 2. ^RS,p2,,,e (e=error handling)
        // Usually defaults are fine for Gen2.

        if (layout.rfid_enabled && layout.rfid_column) {
            // Fetch RFID content
            const rfidContent = replacePlaceholders(layout.rfid_column, data);
            if (rfidContent) {
                // ^RS8 = Type Gen2
                zpl += '^RS8';

                // Heuristic: If content looks like a numeric/hex code (common for simple IDs), 
                // write as Hex (^RFW,H) so scanners showing raw hex see "1234" instead of "31323334".
                // Otherwise fallback to ASCII (^RFW,A).

                const isHexCandidate = /^[0-9A-Fa-f]+$/.test(rfidContent);

                if (isHexCandidate) {
                    // Ensure even length for Hex
                    let hexData = rfidContent;
                    if (hexData.length % 2 !== 0) {
                        hexData = '0' + hexData;
                    }
                    zpl += `^RFW,H^FD${hexData}^FS`;
                } else {
                    zpl += `^RFW,A^FD${cleanText(rfidContent)}^FS`;
                }
            }
        }

        // Use Loop for async await support
        for (const element of layout.layout_data) {
            // Apply Manual Offsets to Coordinates
            // Positive Offset = Move Right/Down (Add to coord)
            const x = mmToDots(element.x, dpi) + offsetLeftDots;
            const y = mmToDots(element.y, dpi) + offsetTopDots;

            const w = mmToDots(element.width, dpi);
            const h = mmToDots(element.height, dpi);

            // Rotation Logic
            let rotation = element.rotation || 0;
            // Normalize to 0-360
            rotation = rotation % 360;
            if (rotation < 0) rotation += 360;

            // Determine ZPL Orientation (N, R, I, B)
            // N = 0, R = 90, I = 180, B = 270
            let orientation = 'N';
            if (rotation >= 45 && rotation < 135) orientation = 'R';
            else if (rotation >= 135 && rotation < 225) orientation = 'I';
            else if (rotation >= 225 && rotation < 315) orientation = 'B';

            // Element Logic
            switch (element.type) {
                case 'text': {
                    const content = replacePlaceholders(element.properties.text || '', data);
                    const fontSize = mmToDots(element.properties.fontSize || 3, dpi);
                    const alignMap: Record<string, string> = { 'left': 'L', 'center': 'C', 'right': 'R' };
                    // If rotated, alignment might need adjustment or is relative to field, which rotates.
                    const align = alignMap[element.properties.textAlign || 'left'];

                    zpl += `^FO${x},${y}`;
                    // ^A<font>,<orientation>,<h>,<w>
                    // Using font 0.
                    zpl += `^A0${orientation},${fontSize},${fontSize}`;
                    // Assuming ^FB acts on the field relative to orientation
                    // ZPL FB width is "width of text block". 
                    zpl += `^FB${w},4,0,${align},0`;
                    zpl += `^FD${cleanText(content)}^FS`;
                    break;
                }
                case 'barcode': {
                    const content = replacePlaceholders(element.properties.text || '', data);
                    // Heuristic for Module Width based on container width
                    // Estimate valid module width (dots) to fill container
                    const estModules = 11 * (content.length || 10) + 20;
                    const moduleWidth = Math.max(1, Math.floor(w / estModules));

                    zpl += `^FO${x},${y}`;
                    zpl += `^BY${moduleWidth},3,${h}`;
                    zpl += `^BC${orientation},${h},Y,N,N`;
                    zpl += `^FD${cleanText(content)}^FS`;
                    break;
                }
                case 'qrcode': {
                    const content = replacePlaceholders(element.properties.text || '', data);
                    // QR Code Version (Size) depends on data length.
                    // URLs are typically 40-100 chars -> Version 4-7.
                    // Version 7 is 45x45 modules.
                    // We need to ensure the QR code fits in 'w'.
                    // Divider 35 assumed Version 4 (33x33).
                    // Divider 45 assumes Version 7 (45x45). Safer for URLs.
                    const magn = Math.min(10, Math.max(2, Math.floor(w / 45)));
                    zpl += `^FO${x},${y}`;
                    // ^BQ<o>,<model>,<magnification> -> Model 2 default
                    zpl += `^BQ${orientation},2,${magn}`;
                    // QA = Quartile Error Correction (High Quality), Automatic Input
                    zpl += `^FDQA,${cleanText(content)}^FS`;
                    break;
                }
                case 'rectangle': {
                    const isRotated = (orientation === 'R' || orientation === 'B');
                    const finalW = isRotated ? h : w;
                    const finalH = isRotated ? w : h;

                    let finalX = x;
                    let finalY = y;

                    if (isRotated) {
                        const centerX = x + w / 2;
                        const centerY = y + h / 2;
                        finalX = centerX - finalW / 2;
                        finalY = centerY - finalH / 2;
                    }

                    const thickness = mmToDots(element.properties.strokeWidth || 1, dpi);
                    zpl += `^FO${Math.round(finalX)},${Math.round(finalY)}`;
                    zpl += `^GB${finalW},${finalH},${thickness},B,0^FS`;
                    break;
                }
                case 'circle': {
                    const thickness = mmToDots(element.properties.strokeWidth || 1, dpi);
                    const diameter = Math.min(w, h);
                    zpl += `^FO${x},${y}`;
                    zpl += `^GC${diameter},${thickness},B^FS`;
                    break;
                }
                case 'line': {
                    const isRotated = (orientation === 'R' || orientation === 'B');
                    const finalW = isRotated ? h : w;
                    const finalH = isRotated ? w : h;

                    let finalX = x;
                    let finalY = y;

                    if (isRotated) {
                        const centerX = x + w / 2;
                        const centerY = y + h / 2;
                        finalX = centerX - finalW / 2;
                        finalY = centerY - finalH / 2;
                    }

                    const thickness = mmToDots(element.properties.strokeWidth || 1, dpi);
                    zpl += `^FO${Math.round(finalX)},${Math.round(finalY)}`;
                    zpl += `^GB${finalW},${finalH},${thickness},B,0^FS`;
                    break;
                }
                case 'image': {
                    if (element.properties.imageUrl) {
                        try {
                            // Pass rotation to image helper
                            const imageZpl = await imageToZPLHex(element.properties.imageUrl, w, h, rotation);
                            if (imageZpl) {
                                zpl += `^FO${x},${y}`;
                                zpl += imageZpl;
                                zpl += '^FS';
                            }
                        } catch (e) {
                            console.error("Failed to generate ZPL for image", e);
                        }
                    }
                    break;
                }
            }
        }

        zpl += '^XZ';
    }

    return zpl;
};
