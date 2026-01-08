
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Subcategory {
  id: string;
  nome: string;
}

export interface Brand {
  id: string;
  nome: string;
}

export const useProductData = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from("SubCategoria")
        .select("*")
        .order("nome");

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error: any) {
      console.error("Error fetching subcategories:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar subcategorias",
        description: error.message,
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("Marca")
        .select("*")
        .order("nome");

      if (error) throw error;
      setBrands(data || []);
    } catch (error: any) {
      console.error("Error fetching brands:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar marcas",
        description: error.message,
      });
    }
  };

  const addSubcategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from("SubCategoria")
        .insert([{ nome: name }])
        .select();

      if (error) throw error;
      
      toast({
        title: "Subcategoria adicionada",
        description: "A subcategoria foi adicionada com sucesso.",
      });
      
      // Refresh the subcategories
      fetchSubcategories();
      return data[0];
    } catch (error: any) {
      console.error("Error adding subcategory:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar subcategoria",
        description: error.message,
      });
      throw error;
    }
  };

  const addBrand = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from("Marca")
        .insert([{ nome: name }])
        .select();

      if (error) throw error;
      
      toast({
        title: "Marca adicionada",
        description: "A marca foi adicionada com sucesso.",
      });
      
      // Refresh the brands
      fetchBrands();
      return data[0];
    } catch (error: any) {
      console.error("Error adding brand:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar marca",
        description: error.message,
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchSubcategories(),
          fetchBrands()
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    subcategories,
    brands,
    isLoading,
    fetchSubcategories,
    fetchBrands,
    addSubcategory,
    addBrand
  };
};
