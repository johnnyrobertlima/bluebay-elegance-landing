import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
// Local Product type since this table may not exist in the schema
interface Product {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  description: string | null;
  category: string | null;
  is_active: boolean | null;
  created_at: string;
}

export default function Products() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites(new Set());
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProducts(data);
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((p) => p.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        setFavorites(new Set((data as any[]).map((f: any) => f.product_id)));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Você precisa estar logado para favoritar produtos.',
      });
      return;
    }

    setFavoriteLoading(productId);
    const isFavorite = favorites.has(productId);

    try {
      if (isFavorite) {
        const { error } = await (supabase as any)
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });

        toast({
          title: 'Removido',
          description: 'Produto removido dos favoritos.',
        });
      } else {
        const { error } = await (supabase as any).from('favorites').insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error) throw error;

        setFavorites((prev) => new Set(prev).add(productId));

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
      setFavoriteLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
              Nossos Produtos
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore nossa coleção exclusiva de peças desenvolvidas com qualidade e estilo.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
                {selectedCategory && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory
                  ? 'Tente ajustar seus filtros de busca.'
                  : 'Não há produtos disponíveis no momento.'}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group relative overflow-hidden hover:shadow-elegant transition-all duration-300"
                >
                  <Link to={`/produtos/${product.id}`} className="block">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}

                      {product.category && (
                        <Badge
                          variant="secondary"
                          className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
                        >
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm transition-all z-10',
                      favorites.has(product.id)
                        ? 'text-red-500 hover:text-red-600 hover:bg-background'
                        : 'text-muted-foreground hover:text-red-500 hover:bg-background'
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(product.id);
                    }}
                    disabled={favoriteLoading === product.id}
                  >
                    <Heart
                      className={cn(
                        'h-5 w-5 transition-all',
                        favorites.has(product.id) && 'fill-current',
                        favoriteLoading === product.id && 'animate-pulse'
                      )}
                    />
                  </Button>

                  <CardContent className="p-4">
                    <Link to={`/produtos/${product.id}`}>
                      <h3 className="font-medium text-foreground truncate mb-1 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(Number(product.price))}
                      </span>
                      <Button size="sm" variant="secondary" asChild>
                        <Link to={`/produtos/${product.id}`}>Ver Detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && filteredProducts.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Exibindo {filteredProducts.length} de {products.length} produtos
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
