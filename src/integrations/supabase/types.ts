export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bluebay_empresa: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      BLUEBAY_ESTOQUE: {
        Row: {
          COMPRADO: number | null
          DISPONIVEL: number | null
          ENTROU: number | null
          FILIAL: number
          FISICO: number | null
          ITEM_CODIGO: string
          LIMITE: number | null
          LOCAL: number
          MATRIZ: number
          RESERVADO: number | null
          SUBLOCAL: string
        }
        Insert: {
          COMPRADO?: number | null
          DISPONIVEL?: number | null
          ENTROU?: number | null
          FILIAL: number
          FISICO?: number | null
          ITEM_CODIGO: string
          LIMITE?: number | null
          LOCAL: number
          MATRIZ: number
          RESERVADO?: number | null
          SUBLOCAL: string
        }
        Update: {
          COMPRADO?: number | null
          DISPONIVEL?: number | null
          ENTROU?: number | null
          FILIAL?: number
          FISICO?: number | null
          ITEM_CODIGO?: string
          LIMITE?: number | null
          LOCAL?: number
          MATRIZ?: number
          RESERVADO?: number | null
          SUBLOCAL?: string
        }
        Relationships: []
      }
      BLUEBAY_FATURAMENTO: {
        Row: {
          DATA_EMISSAO: string | null
          FILIAL: number
          ID_EF_DOCFISCAL: number
          ID_EF_DOCFISCAL_ITEM: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          QUANTIDADE: number | null
          STATUS: string | null
          TIPO: string | null
          TRANSACAO: number | null
          VALOR_DESCONTO: number | null
          VALOR_NOTA: number | null
          VALOR_UNITARIO: number | null
        }
        Insert: {
          DATA_EMISSAO?: string | null
          FILIAL: number
          ID_EF_DOCFISCAL: number
          ID_EF_DOCFISCAL_ITEM: number
          ITEM_CODIGO?: string | null
          MATRIZ: number
          MPED_NUMORDEM?: number | null
          NOTA?: string | null
          PED_ANOBASE?: number | null
          PED_NUMPEDIDO?: string | null
          PES_CODIGO?: number | null
          QUANTIDADE?: number | null
          STATUS?: string | null
          TIPO?: string | null
          TRANSACAO?: number | null
          VALOR_DESCONTO?: number | null
          VALOR_NOTA?: number | null
          VALOR_UNITARIO?: number | null
        }
        Update: {
          DATA_EMISSAO?: string | null
          FILIAL?: number
          ID_EF_DOCFISCAL?: number
          ID_EF_DOCFISCAL_ITEM?: number
          ITEM_CODIGO?: string | null
          MATRIZ?: number
          MPED_NUMORDEM?: number | null
          NOTA?: string | null
          PED_ANOBASE?: number | null
          PED_NUMPEDIDO?: string | null
          PES_CODIGO?: number | null
          QUANTIDADE?: number | null
          STATUS?: string | null
          TIPO?: string | null
          TRANSACAO?: number | null
          VALOR_DESCONTO?: number | null
          VALOR_NOTA?: number | null
          VALOR_UNITARIO?: number | null
        }
        Relationships: []
      }
      bluebay_grupo_item: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          empresa_id: string | null
          gru_codigo: string
          gru_descricao: string
          id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          gru_codigo: string
          gru_descricao: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          gru_codigo?: string
          gru_descricao?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bluebay_grupo_item_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bluebay_empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      BLUEBAY_ITEM: {
        Row: {
          ativo: boolean | null
          CODIGOAUX: string | null
          DATACADASTRO: string | null
          DESCRICAO: string | null
          empresa: string | null
          estacao: string | null
          faixa_etaria: string | null
          FILIAL: number
          genero: string | null
          GRU_CODIGO: string | null
          GRU_DESCRICAO: string | null
          id_marca: string | null
          id_subcategoria: string | null
          ITEM_CODIGO: string
          MATRIZ: number
          ncm: string | null
        }
        Insert: {
          ativo?: boolean | null
          CODIGOAUX?: string | null
          DATACADASTRO?: string | null
          DESCRICAO?: string | null
          empresa?: string | null
          estacao?: string | null
          faixa_etaria?: string | null
          FILIAL: number
          genero?: string | null
          GRU_CODIGO?: string | null
          GRU_DESCRICAO?: string | null
          id_marca?: string | null
          id_subcategoria?: string | null
          ITEM_CODIGO: string
          MATRIZ: number
          ncm?: string | null
        }
        Update: {
          ativo?: boolean | null
          CODIGOAUX?: string | null
          DATACADASTRO?: string | null
          DESCRICAO?: string | null
          empresa?: string | null
          estacao?: string | null
          faixa_etaria?: string | null
          FILIAL?: number
          genero?: string | null
          GRU_CODIGO?: string | null
          GRU_DESCRICAO?: string | null
          id_marca?: string | null
          id_subcategoria?: string | null
          ITEM_CODIGO?: string
          MATRIZ?: number
          ncm?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "BLUEBAY_ITEM_id_marca_fkey"
            columns: ["id_marca"]
            isOneToOne: false
            referencedRelation: "Marca"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BLUEBAY_ITEM_id_subcategoria_fkey"
            columns: ["id_subcategoria"]
            isOneToOne: false
            referencedRelation: "SubCategoria"
            referencedColumns: ["id"]
          },
        ]
      }
      BLUEBAY_ITEM_VARIACAO: {
        Row: {
          created_at: string | null
          ean: string | null
          filial: number
          id: string
          id_cor: string | null
          id_tamanho: string | null
          item_codigo: string
          matriz: number
          quantidade: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ean?: string | null
          filial: number
          id?: string
          id_cor?: string | null
          id_tamanho?: string | null
          item_codigo: string
          matriz: number
          quantidade?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ean?: string | null
          filial?: number
          id?: string
          id_cor?: string | null
          id_tamanho?: string | null
          item_codigo?: string
          matriz?: number
          quantidade?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "BLUEBAY_ITEM_VARIACAO_id_cor_fkey"
            columns: ["id_cor"]
            isOneToOne: false
            referencedRelation: "Cor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BLUEBAY_ITEM_VARIACAO_id_tamanho_fkey"
            columns: ["id_tamanho"]
            isOneToOne: false
            referencedRelation: "Tamanho"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BLUEBAY_ITEM_VARIACAO_item_codigo_matriz_filial_fkey"
            columns: ["item_codigo", "matriz", "filial"]
            isOneToOne: false
            referencedRelation: "BLUEBAY_ITEM"
            referencedColumns: ["ITEM_CODIGO", "MATRIZ", "FILIAL"]
          },
        ]
      }
      BLUEBAY_PEDIDO: {
        Row: {
          CENTROCUSTO: string | null
          DATA_PEDIDO: string | null
          FILIAL: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number
          PED_ANOBASE: number
          PED_NUMPEDIDO: string
          PEDIDO: string | null
          PEDIDO_CLIENTE: string | null
          PEDIDO_OUTRO: string | null
          PES_CODIGO: number | null
          QTDE_ENTREGUE: number | null
          QTDE_PEDIDA: number | null
          QTDE_SALDO: number | null
          REPRESENTANTE: number | null
          STATUS: string | null
          TOTAL_PRODUTO: number | null
          VALOR_UNITARIO: number | null
        }
        Insert: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL: number
          ITEM_CODIGO?: string | null
          MATRIZ: number
          MPED_NUMORDEM: number
          PED_ANOBASE: number
          PED_NUMPEDIDO: string
          PEDIDO?: string | null
          PEDIDO_CLIENTE?: string | null
          PEDIDO_OUTRO?: string | null
          PES_CODIGO?: number | null
          QTDE_ENTREGUE?: number | null
          QTDE_PEDIDA?: number | null
          QTDE_SALDO?: number | null
          REPRESENTANTE?: number | null
          STATUS?: string | null
          TOTAL_PRODUTO?: number | null
          VALOR_UNITARIO?: number | null
        }
        Update: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL?: number
          ITEM_CODIGO?: string | null
          MATRIZ?: number
          MPED_NUMORDEM?: number
          PED_ANOBASE?: number
          PED_NUMPEDIDO?: string
          PEDIDO?: string | null
          PEDIDO_CLIENTE?: string | null
          PEDIDO_OUTRO?: string | null
          PES_CODIGO?: number | null
          QTDE_ENTREGUE?: number | null
          QTDE_PEDIDA?: number | null
          QTDE_SALDO?: number | null
          REPRESENTANTE?: number | null
          STATUS?: string | null
          TOTAL_PRODUTO?: number | null
          VALOR_UNITARIO?: number | null
        }
        Relationships: []
      }
      BLUEBAY_PESSOA: {
        Row: {
          APELIDO: string | null
          BAIRRO: string | null
          CATEGORIA: string | null
          CEP: string | null
          CIDADE: string | null
          CNPJCPF: string | null
          COMPLEMENTO: string | null
          DATACADASTRO: string | null
          EMAIL: string | null
          ENDERECO: string | null
          fator_correcao: number | null
          INSCRICAO_ESTADUAL: string | null
          NOME_CATEGORIA: string | null
          NUMERO: string | null
          PES_CODIGO: number
          RAZAOSOCIAL: string | null
          TELEFONE: string | null
          UF: string | null
          volume_saudavel_faturamento: number | null
        }
        Insert: {
          APELIDO?: string | null
          BAIRRO?: string | null
          CATEGORIA?: string | null
          CEP?: string | null
          CIDADE?: string | null
          CNPJCPF?: string | null
          COMPLEMENTO?: string | null
          DATACADASTRO?: string | null
          EMAIL?: string | null
          ENDERECO?: string | null
          fator_correcao?: number | null
          INSCRICAO_ESTADUAL?: string | null
          NOME_CATEGORIA?: string | null
          NUMERO?: string | null
          PES_CODIGO: number
          RAZAOSOCIAL?: string | null
          TELEFONE?: string | null
          UF?: string | null
          volume_saudavel_faturamento?: number | null
        }
        Update: {
          APELIDO?: string | null
          BAIRRO?: string | null
          CATEGORIA?: string | null
          CEP?: string | null
          CIDADE?: string | null
          CNPJCPF?: string | null
          COMPLEMENTO?: string | null
          DATACADASTRO?: string | null
          EMAIL?: string | null
          ENDERECO?: string | null
          fator_correcao?: number | null
          INSCRICAO_ESTADUAL?: string | null
          NOME_CATEGORIA?: string | null
          NUMERO?: string | null
          PES_CODIGO?: number
          RAZAOSOCIAL?: string | null
          TELEFONE?: string | null
          UF?: string | null
          volume_saudavel_faturamento?: number | null
        }
        Relationships: []
      }
      BLUEBAY_REPRESENTANTE: {
        Row: {
          PES_CODIGO: number
        }
        Insert: {
          PES_CODIGO: number
        }
        Update: {
          PES_CODIGO?: number
        }
        Relationships: []
      }
      BLUEBAY_TITULO: {
        Row: {
          ANOBASE: number
          DTEMISSAO: string | null
          DTPAGTO: string | null
          DTVENCIMENTO: string | null
          DTVENCTO: string | null
          FILIAL: number
          MATRIZ: number
          NUMDOCUMENTO: string | null
          NUMLCTO: number
          NUMNOTA: number | null
          PES_CODIGO: string | null
          STATUS: string | null
          TIPO: string
          VLRABATIMENTO: number | null
          VLRDESCONTO: number | null
          VLRSALDO: number | null
          VLRTITULO: number | null
        }
        Insert: {
          ANOBASE: number
          DTEMISSAO?: string | null
          DTPAGTO?: string | null
          DTVENCIMENTO?: string | null
          DTVENCTO?: string | null
          FILIAL: number
          MATRIZ: number
          NUMDOCUMENTO?: string | null
          NUMLCTO: number
          NUMNOTA?: number | null
          PES_CODIGO?: string | null
          STATUS?: string | null
          TIPO: string
          VLRABATIMENTO?: number | null
          VLRDESCONTO?: number | null
          VLRSALDO?: number | null
          VLRTITULO?: number | null
        }
        Update: {
          ANOBASE?: number
          DTEMISSAO?: string | null
          DTPAGTO?: string | null
          DTVENCIMENTO?: string | null
          DTVENCTO?: string | null
          FILIAL?: number
          MATRIZ?: number
          NUMDOCUMENTO?: string | null
          NUMLCTO?: number
          NUMNOTA?: number | null
          PES_CODIGO?: string | null
          STATUS?: string | null
          TIPO?: string
          VLRABATIMENTO?: number | null
          VLRDESCONTO?: number | null
          VLRSALDO?: number | null
          VLRTITULO?: number | null
        }
        Relationships: []
      }
      Cor: {
        Row: {
          codigo_hex: string | null
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          codigo_hex?: string | null
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          codigo_hex?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      Marca: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      SubCategoria: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Tamanho: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      bluebay_view_faturamento_resumo: {
        Row: {
          DESCRICAO: string | null
          GRU_DESCRICAO: string | null
          ITEM_CODIGO: string | null
          media_valor_unitario: number | null
          primeira_venda: string | null
          total_quantidade: number | null
          total_registros: number | null
          total_valor: number | null
          ultima_venda: string | null
        }
        Relationships: []
      }
      vw_representantes: {
        Row: {
          APELIDO: string | null
          codigo_representante: number | null
          EMAIL: string | null
          nome_representante: string | null
          TELEFONE: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_bluebay_faturamento: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          DATA_EMISSAO: string
          FILIAL: number
          ID_EF_DOCFISCAL: number
          ID_EF_DOCFISCAL_ITEM: number
          ITEM_CODIGO: string
          MATRIZ: number
          MPED_NUMORDEM: number
          NOTA: string
          PED_ANOBASE: number
          PED_NUMPEDIDO: string
          PES_CODIGO: number
          QUANTIDADE: number
          STATUS: string
          TIPO: string
          TRANSACAO: number
          VALOR_DESCONTO: number
          VALOR_NOTA: number
          VALOR_UNITARIO: number
        }[]
      }
      get_stock_sales_analytics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          CUSTO_MEDIO: number
          DATA_ULTIMA_VENDA: string
          DATACADASTRO: string
          DESCRICAO: string
          DIAS_COBERTURA: number
          DISPONIVEL: number
          ENTROU: number
          FISICO: number
          GIRO_ESTOQUE: number
          GRU_DESCRICAO: string
          ITEM_CODIGO: string
          LIMITE: number
          PERCENTUAL_ESTOQUE_VENDIDO: number
          PRECO_MEDIO: number
          PRODUTO_NOVO: boolean
          QTD_VENDIDA: number
          RANKING: number
          RESERVADO: number
          VALOR_TOTAL_VENDIDO: number
        }[]
      }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
