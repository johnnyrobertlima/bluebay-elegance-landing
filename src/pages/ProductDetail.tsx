import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, Minus, Plus, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkFavorite();
    }
  }, [user, id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o produto.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Você precisa estar logado para favoritar produtos.',
      });
      return;
    }

    if (!id) return;

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: 'Removido',
          description: 'Produto removido dos favoritos.',
        });
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          product_id: id,
        });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: 'Adicionado',
          description: 'Produto adicionado aos favoritos!',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os favoritos.',
        variant: 'destructive',
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);
    setAddedToCart(true);

    toast({
      title: 'Adicionado ao carrinho',
      description: `${quantity}x ${product.name} foi adicionado ao seu carrinho.`,
    });

    setTimeout(() => setAddedToCart(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4 text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-display text-foreground mb-2">
              Produto não encontrado
            </h2>
            <p className="text-muted-foreground mb-6">
              O produto que você está procurando não existe ou foi removido.
            </p>
            <Button asChild>
              <Link to="/produtos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para produtos
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <span>/</span>
            <Link to="/produtos" className="hover:text-primary transition-colors">
              Produtos
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <span className="text-8xl">📦</span>
                </div>
              )}

              {product.category && (
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm"
                >
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  {product.name}
                </h1>

                <p className="text-3xl font-semibold text-primary mb-6">
                  {formatCurrency(Number(product.price))}
                </p>

                {product.description && (
                  <div className="mb-8">
                    <h3 className="font-medium text-foreground mb-2">Descrição</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <h3 className="font-medium text-foreground mb-3">Quantidade</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-lg font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  size="lg"
                  className={cn(
                    'flex-1 h-12 transition-all',
                    addedToCart && 'bg-green-600 hover:bg-green-700'
                  )}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Adicionado!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Adicionar ao Carrinho
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    'h-12 transition-all',
                    isFavorite && 'text-red-500 border-red-500 hover:bg-red-50'
                  )}
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                >
                  <Heart
                    className={cn(
                      'mr-2 h-5 w-5',
                      isFavorite && 'fill-current',
                      favoriteLoading && 'animate-pulse'
                    )}
                  />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Coleção Outono/Inverno 2026</strong>
                  <br />
                  Peça exclusiva desenvolvida com materiais premium e acabamento de alta qualidade.
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-12">
            <Button variant="ghost" asChild>
              <Link to="/produtos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para produtos
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
