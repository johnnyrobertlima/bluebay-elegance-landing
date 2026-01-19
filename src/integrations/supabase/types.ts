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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accesses: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          internal_map_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          internal_map_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          internal_map_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_notices: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ADs: {
        Row: {
          account_id: string | null
          action_values_json: Json | null
          actions_json: Json | null
          ad_id: string | null
          ad_name: string | null
          adset_id: string | null
          adset_name: string | null
          campaign_id: string | null
          campaign_name: string | null
          clicks: number | null
          conversion_values_json: Json | null
          cpc: number | null
          cpp: number | null
          ctr: number | null
          date_start: string | null
          date_stop: string | null
          frequency: number | null
          impressions: number | null
          inline_link_clicks: number | null
          inline_post_engagement: number | null
          objective: string | null
          optimization_goal: string | null
          reach: number | null
          spend: number | null
          unique_actions_json: Json | null
        }
        Insert: {
          account_id?: string | null
          action_values_json?: Json | null
          actions_json?: Json | null
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          conversion_values_json?: Json | null
          cpc?: number | null
          cpp?: number | null
          ctr?: number | null
          date_start?: string | null
          date_stop?: string | null
          frequency?: number | null
          impressions?: number | null
          inline_link_clicks?: number | null
          inline_post_engagement?: number | null
          objective?: string | null
          optimization_goal?: string | null
          reach?: number | null
          spend?: number | null
          unique_actions_json?: Json | null
        }
        Update: {
          account_id?: string | null
          action_values_json?: Json | null
          actions_json?: Json | null
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          conversion_values_json?: Json | null
          cpc?: number | null
          cpp?: number | null
          ctr?: number | null
          date_start?: string | null
          date_stop?: string | null
          frequency?: number | null
          impressions?: number | null
          inline_link_clicks?: number | null
          inline_post_engagement?: number | null
          objective?: string | null
          optimization_goal?: string | null
          reach?: number | null
          spend?: number | null
          unique_actions_json?: Json | null
        }
        Relationships: []
      }
      app_user_roles: {
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
      approved_orders: {
        Row: {
          action: string | null
          approved_at: string | null
          cliente_data: Json
          id: string
          separacao_id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          approved_at?: string | null
          cliente_data: Json
          id?: string
          separacao_id: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          approved_at?: string | null
          cliente_data?: Json
          id?: string
          separacao_id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_transaction_logs: {
        Row: {
          bill_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          response_payload: Json | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          bill_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          response_payload?: Json | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          bill_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          response_payload?: Json | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transaction_logs_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "contas_a_pagar"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          page_location: string | null
          title: string
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          page_location?: string | null
          title: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          page_location?: string | null
          title?: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      bk_requests: {
        Row: {
          attachment_url: string | null
          created_at: string
          department: string
          description: string
          id: string
          protocol: string
          response: string | null
          status: string
          title: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          department: string
          description: string
          id?: string
          protocol: string
          response?: string | null
          status?: string
          title: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          department?: string
          description?: string
          id?: string
          protocol?: string
          response?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      bktex_products: {
        Row: {
          category: string
          color: string | null
          composition: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_order_quantity: number | null
          name: string
          price: number | null
          price_unit: string | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category: string
          color?: string | null
          composition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_quantity?: number | null
          name: string
          price?: number | null
          price_unit?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string | null
          composition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_order_quantity?: number | null
          name?: string
          price?: number | null
          price_unit?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      bluebay_empresa: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
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
      bluebay_group: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          redirect_after_login: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          redirect_after_login?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          redirect_after_login?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bluebay_group_member: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bluebay_group_member_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "bluebay_group"
            referencedColumns: ["id"]
          },
        ]
      }
      bluebay_grupo_item: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string | null
          gru_codigo: string
          gru_descricao: string
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string | null
          gru_codigo: string
          gru_descricao: string
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string | null
          gru_codigo?: string
          gru_descricao?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bluebay_grupo_item_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bluebay_empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bluebay_grupo_item_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bluebay_grupo_item_view"
            referencedColumns: ["empresa_id"]
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
            foreignKeyName: "fk_marca"
            columns: ["id_marca"]
            isOneToOne: false
            referencedRelation: "Marca"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcategoria"
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
      BLUEBAY_PEDIDO_ORG: {
        Row: {
          CENTROCUSTO: string | null
          DATA_PEDIDO: string | null
          FILIAL: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number
          PED_ANOBASE: string
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
          PED_ANOBASE: string
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
          PED_ANOBASE?: string
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
      boleto_emissao: {
        Row: {
          cliente_id: string
          codigo_barras: string | null
          codigo_solicitacao: string | null
          created_at: string
          data_vencimento: string | null
          id: string
          inter_response: Json | null
          linha_digitavel: string | null
          nosso_numero: string | null
          status: string
          updated_at: string
          url_boleto: string | null
          valor: number
          vencimento: string
        }
        Insert: {
          cliente_id: string
          codigo_barras?: string | null
          codigo_solicitacao?: string | null
          created_at?: string
          data_vencimento?: string | null
          id?: string
          inter_response?: Json | null
          linha_digitavel?: string | null
          nosso_numero?: string | null
          status?: string
          updated_at?: string
          url_boleto?: string | null
          valor: number
          vencimento: string
        }
        Update: {
          cliente_id?: string
          codigo_barras?: string | null
          codigo_solicitacao?: string | null
          created_at?: string
          data_vencimento?: string | null
          id?: string
          inter_response?: Json | null
          linha_digitavel?: string | null
          nosso_numero?: string | null
          status?: string
          updated_at?: string
          url_boleto?: string | null
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "boleto_emissao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          mailing_id: string | null
          message: string
          name: string
          Status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          mailing_id?: string | null
          message: string
          name: string
          Status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          mailing_id?: string | null
          message?: string
          name?: string
          Status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "Clientes_Whats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_mailing_id_fkey"
            columns: ["mailing_id"]
            isOneToOne: false
            referencedRelation: "mailing"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Clientes_Whats: {
        Row: {
          created_at: string | null
          enviar_domingo: boolean | null
          enviar_sabado: boolean | null
          horario_final: string
          horario_inicial: string
          id: string
          nome: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          enviar_domingo?: boolean | null
          enviar_sabado?: boolean | null
          horario_final: string
          horario_inicial: string
          id?: string
          nome: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          enviar_domingo?: boolean | null
          enviar_sabado?: boolean | null
          horario_final?: string
          horario_inicial?: string
          id?: string
          nome?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      config_bancaria: {
        Row: {
          agencia: string | null
          ambiente: string
          ativo: boolean
          banco: string
          chave_api: string | null
          client_id: string | null
          client_secret: string | null
          conta: string | null
          conta_digito: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ambiente?: string
          ativo?: boolean
          banco?: string
          chave_api?: string | null
          client_id?: string | null
          client_secret?: string | null
          conta?: string | null
          conta_digito?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ambiente?: string
          ativo?: boolean
          banco?: string
          chave_api?: string | null
          client_id?: string | null
          client_secret?: string | null
          conta?: string | null
          conta_digito?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string | null
          message: string
          name: string
          phone: string | null
          read: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string | null
          message: string
          name: string
          phone?: string | null
          read?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string | null
          message?: string
          name?: string
          phone?: string | null
          read?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contas_a_pagar: {
        Row: {
          arquivo_anexo_url: string | null
          arquivo_boleto_url: string | null
          arquivo_nota_fiscal_url: string | null
          atualizado_por: string | null
          categoria_id: string | null
          codigo_barras: string | null
          created_at: string | null
          criado_por: string | null
          data_agendamento: string | null
          data_pagamento: string | null
          data_vencimento: string
          desconto: number | null
          descricao: string
          forma_pagamento: string | null
          fornecedor_id: string
          id: string
          ignorar_reembolso: boolean | null
          juros: number | null
          linha_digitavel: string | null
          mensagem_erro_banco: string | null
          metodo_pagamento:
            | Database["public"]["Enums"]["metodo_pagamento"]
            | null
          multa: number | null
          nivel_aprovacao_requerido: number | null
          numero_documento: string | null
          observacoes: string | null
          pix_chave: string | null
          pix_tipo_chave: string | null
          protocolo_banco: string | null
          reembolso_lote_id: string | null
          requer_aprovacao: boolean
          status: Database["public"]["Enums"]["status_conta"]
          status_banco: string | null
          transacao_id: string | null
          updated_at: string | null
          valor: number
          valor_pago: number | null
        }
        Insert: {
          arquivo_anexo_url?: string | null
          arquivo_boleto_url?: string | null
          arquivo_nota_fiscal_url?: string | null
          atualizado_por?: string | null
          categoria_id?: string | null
          codigo_barras?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_agendamento?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          desconto?: number | null
          descricao: string
          forma_pagamento?: string | null
          fornecedor_id: string
          id?: string
          ignorar_reembolso?: boolean | null
          juros?: number | null
          linha_digitavel?: string | null
          mensagem_erro_banco?: string | null
          metodo_pagamento?:
            | Database["public"]["Enums"]["metodo_pagamento"]
            | null
          multa?: number | null
          nivel_aprovacao_requerido?: number | null
          numero_documento?: string | null
          observacoes?: string | null
          pix_chave?: string | null
          pix_tipo_chave?: string | null
          protocolo_banco?: string | null
          reembolso_lote_id?: string | null
          requer_aprovacao?: boolean
          status?: Database["public"]["Enums"]["status_conta"]
          status_banco?: string | null
          transacao_id?: string | null
          updated_at?: string | null
          valor: number
          valor_pago?: number | null
        }
        Update: {
          arquivo_anexo_url?: string | null
          arquivo_boleto_url?: string | null
          arquivo_nota_fiscal_url?: string | null
          atualizado_por?: string | null
          categoria_id?: string | null
          codigo_barras?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_agendamento?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          desconto?: number | null
          descricao?: string
          forma_pagamento?: string | null
          fornecedor_id?: string
          id?: string
          ignorar_reembolso?: boolean | null
          juros?: number | null
          linha_digitavel?: string | null
          mensagem_erro_banco?: string | null
          metodo_pagamento?:
            | Database["public"]["Enums"]["metodo_pagamento"]
            | null
          multa?: number | null
          nivel_aprovacao_requerido?: number | null
          numero_documento?: string | null
          observacoes?: string | null
          pix_chave?: string | null
          pix_tipo_chave?: string | null
          protocolo_banco?: string | null
          reembolso_lote_id?: string | null
          requer_aprovacao?: boolean
          status?: Database["public"]["Enums"]["status_conta"]
          status_banco?: string | null
          transacao_id?: string | null
          updated_at?: string | null
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "contas_pagar_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_a_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_a_pagar_reembolso_lote_id_fkey"
            columns: ["reembolso_lote_id"]
            isOneToOne: false
            referencedRelation: "reembolso_lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar_aprovacoes: {
        Row: {
          aprovador_id: string
          comentario: string | null
          conta_pagar_id: string
          created_at: string | null
          data_aprovacao: string | null
          id: string
          nivel_aprovacao: number
          status_aprovacao: Database["public"]["Enums"]["status_aprovacao"]
        }
        Insert: {
          aprovador_id: string
          comentario?: string | null
          conta_pagar_id: string
          created_at?: string | null
          data_aprovacao?: string | null
          id?: string
          nivel_aprovacao?: number
          status_aprovacao?: Database["public"]["Enums"]["status_aprovacao"]
        }
        Update: {
          aprovador_id?: string
          comentario?: string | null
          conta_pagar_id?: string
          created_at?: string | null
          data_aprovacao?: string | null
          id?: string
          nivel_aprovacao?: number
          status_aprovacao?: Database["public"]["Enums"]["status_aprovacao"]
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_aprovacoes_conta_pagar_id_fkey"
            columns: ["conta_pagar_id"]
            isOneToOne: false
            referencedRelation: "contas_a_pagar"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar_categorias: {
        Row: {
          ativo: boolean
          categoria_pai_id: string | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          categoria_pai_id?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          categoria_pai_id?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_categorias_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "contas_pagar_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar_logs_auditoria: {
        Row: {
          acao: Database["public"]["Enums"]["acao_auditoria"]
          data_hora: string | null
          detalhes: Json | null
          entidade: string
          id: string
          ip_address: unknown
          registro_id: string
          usuario_id: string | null
        }
        Insert: {
          acao: Database["public"]["Enums"]["acao_auditoria"]
          data_hora?: string | null
          detalhes?: Json | null
          entidade: string
          id?: string
          ip_address?: unknown
          registro_id: string
          usuario_id?: string | null
        }
        Update: {
          acao?: Database["public"]["Enums"]["acao_auditoria"]
          data_hora?: string | null
          detalhes?: Json | null
          entidade?: string
          id?: string
          ip_address?: unknown
          registro_id?: string
          usuario_id?: string | null
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
      Disparos: {
        Row: {
          cliente: string | null
          Data: string | null
          id: string
          Mailing: string | null
          msg: string | null
          nome: string | null
          status: string | null
          Token: string | null
        }
        Insert: {
          cliente?: string | null
          Data?: string | null
          id: string
          Mailing?: string | null
          msg?: string | null
          nome?: string | null
          status?: string | null
          Token?: string | null
        }
        Update: {
          cliente?: string | null
          Data?: string | null
          id?: string
          Mailing?: string | null
          msg?: string | null
          nome?: string | null
          status?: string | null
          Token?: string | null
        }
        Relationships: []
      }
      editorial_lines: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      evolution_api_config: {
        Row: {
          api_key: string | null
          ativo: boolean
          created_at: string
          id: string
          instance_name: string | null
          token: string
          updated_at: string
          url_base: string
        }
        Insert: {
          api_key?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          instance_name?: string | null
          token: string
          updated_at?: string
          url_base?: string
        }
        Update: {
          api_key?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          instance_name?: string | null
          token?: string
          updated_at?: string
          url_base?: string
        }
        Relationships: []
      }
      feirinha_novo_cliente: {
        Row: {
          corredor: string
          created_at: string
          data_inauguracao: string
          id: string
          nome_lojista: string
          numero_banca: string
          observacao: string | null
          solicitante: string
          status_agendamento: string
          telefone_proprietario: string
        }
        Insert: {
          corredor: string
          created_at?: string
          data_inauguracao: string
          id?: string
          nome_lojista: string
          numero_banca: string
          observacao?: string | null
          solicitante: string
          status_agendamento?: string
          telefone_proprietario: string
        }
        Update: {
          corredor?: string
          created_at?: string
          data_inauguracao?: string
          id?: string
          nome_lojista?: string
          numero_banca?: string
          observacao?: string | null
          solicitante?: string
          status_agendamento?: string
          telefone_proprietario?: string
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          agencia: string | null
          ativo: boolean
          banco: string | null
          cep: string | null
          chave_pix: string | null
          cidade: string | null
          condicoes_pagamento: string | null
          conta: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          razao_social: string | null
          telefone: string | null
          tipo_chave_pix: string | null
          tipo_conta: string | null
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          condicoes_pagamento?: string | null
          conta?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          razao_social?: string | null
          telefone?: string | null
          tipo_chave_pix?: string | null
          tipo_conta?: string | null
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          condicoes_pagamento?: string | null
          conta?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          razao_social?: string | null
          telefone?: string | null
          tipo_chave_pix?: string | null
          tipo_conta?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string | null
        }
        Relationships: []
      }
      galleries: {
        Row: {
          city: string | null
          code: string
          cover_image_url: string | null
          created_at: string
          email: string | null
          gallery_images: string[] | null
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          saturday_hours: string | null
          state: string | null
          street: string | null
          sunday_hours: string | null
          updated_at: string
          weekday_hours: string
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          code: string
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          gallery_images?: string[] | null
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          saturday_hours?: string | null
          state?: string | null
          street?: string | null
          sunday_hours?: string | null
          updated_at?: string
          weekday_hours: string
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          code?: string
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          gallery_images?: string[] | null
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          saturday_hours?: string | null
          state?: string | null
          street?: string | null
          sunday_hours?: string | null
          updated_at?: string
          weekday_hours?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      group_client_access: {
        Row: {
          all_clients: boolean
          client_id: string | null
          created_at: string
          group_id: string
          id: string
          updated_at: string
        }
        Insert: {
          all_clients?: boolean
          client_id?: string | null
          created_at?: string
          group_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          all_clients?: boolean
          client_id?: string | null
          created_at?: string
          group_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_client_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_client_access_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_page_permissions: {
        Row: {
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          group_id: string
          id: string
          page_id: string
        }
        Insert: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          group_id: string
          id?: string
          page_id: string
        }
        Update: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          group_id?: string
          id?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_page_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_page_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_page_permissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "system_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      group_permissions: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          permission_type: Database["public"]["Enums"]["permission_type"]
          resource_path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          permission_type: Database["public"]["Enums"]["permission_type"]
          resource_path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          permission_type?: Database["public"]["Enums"]["permission_type"]
          resource_path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          homepage: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          homepage?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          homepage?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      index_categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      index_content: {
        Row: {
          created_at: string | null
          id: string
          key: string
          type: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      index_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          section_id: string | null
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          section_id?: string | null
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          section_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "index_images_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "index_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      index_sections: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      insights_social: {
        Row: {
          account_id: string | null
          actor_id: string | null
          ad_id: string | null
          Alcance: string | null
          body: string | null
          Campanha: string | null
          canal: string | null
          Cliente: string | null
          cliques: number | null
          Cliques: string | null
          Comentários: string | null
          comments: number | null
          Compartilhamentos: string | null
          cpc: number | null
          cpm: number | null
          created_time: string | null
          creative_id: string | null
          Curtidas: string | null
          Custo_por_Mensagem: string | null
          Custo_por_Mensagens: number | null
          Data: string | null
          effective_status: string | null
          follows: number | null
          Frequência: number | null
          Gasto: number | null
          id: string | null
          Impressões: number | null
          Impressões_Orgânicas: string | null
          Impressões_Pagas: string | null
          instagram_permalink_url: string | null
          instagram_user_id: string | null
          Interações_Totais: string | null
          is_merged_child: boolean | null
          likes: number | null
          linked_post_id: string | null
          media_type: string | null
          mensagens: number | null
          merged_group_id: string | null
          merged_with_posts: Json | null
          message: string | null
          name: string | null
          object_type: string | null
          permalink: string | null
          permalink_url: string | null
          post_clicks: number | null
          post_id: string
          post_impressions_organic: number | null
          post_impressions_paid: number | null
          post_video_views: number | null
          post_video_views_organic: number | null
          post_video_views_paid: number | null
          profile_visits: number | null
          reach: number | null
          Reel_ID: string | null
          reelid: string | null
          reelId: string | null
          Salvamentos: string | null
          saved: number | null
          Seguidores_Ganhos: string | null
          shares: number | null
          timestamp: string | null
          total_comments: number | null
          total_interactions: number | null
          updated_time: string | null
          VideoViews: string | null
          VideoViews_Orgânicas: string | null
          VideoViews_Pagas: string | null
          views: number | null
          Visitas_Perfil: string | null
          Visualizações: string | null
        }
        Insert: {
          account_id?: string | null
          actor_id?: string | null
          ad_id?: string | null
          Alcance?: string | null
          body?: string | null
          Campanha?: string | null
          canal?: string | null
          Cliente?: string | null
          cliques?: number | null
          Cliques?: string | null
          Comentários?: string | null
          comments?: number | null
          Compartilhamentos?: string | null
          cpc?: number | null
          cpm?: number | null
          created_time?: string | null
          creative_id?: string | null
          Curtidas?: string | null
          Custo_por_Mensagem?: string | null
          Custo_por_Mensagens?: number | null
          Data?: string | null
          effective_status?: string | null
          follows?: number | null
          Frequência?: number | null
          Gasto?: number | null
          id?: string | null
          Impressões?: number | null
          Impressões_Orgânicas?: string | null
          Impressões_Pagas?: string | null
          instagram_permalink_url?: string | null
          instagram_user_id?: string | null
          Interações_Totais?: string | null
          is_merged_child?: boolean | null
          likes?: number | null
          linked_post_id?: string | null
          media_type?: string | null
          mensagens?: number | null
          merged_group_id?: string | null
          merged_with_posts?: Json | null
          message?: string | null
          name?: string | null
          object_type?: string | null
          permalink?: string | null
          permalink_url?: string | null
          post_clicks?: number | null
          post_id: string
          post_impressions_organic?: number | null
          post_impressions_paid?: number | null
          post_video_views?: number | null
          post_video_views_organic?: number | null
          post_video_views_paid?: number | null
          profile_visits?: number | null
          reach?: number | null
          Reel_ID?: string | null
          reelid?: string | null
          reelId?: string | null
          Salvamentos?: string | null
          saved?: number | null
          Seguidores_Ganhos?: string | null
          shares?: number | null
          timestamp?: string | null
          total_comments?: number | null
          total_interactions?: number | null
          updated_time?: string | null
          VideoViews?: string | null
          VideoViews_Orgânicas?: string | null
          VideoViews_Pagas?: string | null
          views?: number | null
          Visitas_Perfil?: string | null
          Visualizações?: string | null
        }
        Update: {
          account_id?: string | null
          actor_id?: string | null
          ad_id?: string | null
          Alcance?: string | null
          body?: string | null
          Campanha?: string | null
          canal?: string | null
          Cliente?: string | null
          cliques?: number | null
          Cliques?: string | null
          Comentários?: string | null
          comments?: number | null
          Compartilhamentos?: string | null
          cpc?: number | null
          cpm?: number | null
          created_time?: string | null
          creative_id?: string | null
          Curtidas?: string | null
          Custo_por_Mensagem?: string | null
          Custo_por_Mensagens?: number | null
          Data?: string | null
          effective_status?: string | null
          follows?: number | null
          Frequência?: number | null
          Gasto?: number | null
          id?: string | null
          Impressões?: number | null
          Impressões_Orgânicas?: string | null
          Impressões_Pagas?: string | null
          instagram_permalink_url?: string | null
          instagram_user_id?: string | null
          Interações_Totais?: string | null
          is_merged_child?: boolean | null
          likes?: number | null
          linked_post_id?: string | null
          media_type?: string | null
          mensagens?: number | null
          merged_group_id?: string | null
          merged_with_posts?: Json | null
          message?: string | null
          name?: string | null
          object_type?: string | null
          permalink?: string | null
          permalink_url?: string | null
          post_clicks?: number | null
          post_id?: string
          post_impressions_organic?: number | null
          post_impressions_paid?: number | null
          post_video_views?: number | null
          post_video_views_organic?: number | null
          post_video_views_paid?: number | null
          profile_visits?: number | null
          reach?: number | null
          Reel_ID?: string | null
          reelid?: string | null
          reelId?: string | null
          Salvamentos?: string | null
          saved?: number | null
          Seguidores_Ganhos?: string | null
          shares?: number | null
          timestamp?: string | null
          total_comments?: number | null
          total_interactions?: number | null
          updated_time?: string | null
          VideoViews?: string | null
          VideoViews_Orgânicas?: string | null
          VideoViews_Pagas?: string | null
          views?: number | null
          Visitas_Perfil?: string | null
          Visualizações?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_social_linked_post_id_fkey"
            columns: ["linked_post_id"]
            isOneToOne: false
            referencedRelation: "insights_social"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_media: {
        Row: {
          canal: string | null
          caption: string | null
          cliente: string | null
          computed_thumb_url: string | null
          id: string
          inserted_at: string
          is_comment_enabled: boolean
          media_product_type: string
          media_type: string
          media_url: string
          owner_id: string
          permalink: string | null
          posted_at: string
          raw: Json | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          canal?: string | null
          caption?: string | null
          cliente?: string | null
          computed_thumb_url?: string | null
          id: string
          inserted_at?: string
          is_comment_enabled?: boolean
          media_product_type: string
          media_type: string
          media_url: string
          owner_id: string
          permalink?: string | null
          posted_at: string
          raw?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          canal?: string | null
          caption?: string | null
          cliente?: string | null
          computed_thumb_url?: string | null
          id?: string
          inserted_at?: string
          is_comment_enabled?: boolean
          media_product_type?: string
          media_type?: string
          media_url?: string
          owner_id?: string
          permalink?: string | null
          posted_at?: string
          raw?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      instagram_media_child: {
        Row: {
          id: string
          media_type: string
          media_url: string
          parent_id: string
          thumbnail_url: string | null
        }
        Insert: {
          id: string
          media_type: string
          media_url: string
          parent_id: string
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          media_type?: string
          media_url?: string
          parent_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_media_child_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "instagram_media"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_media_insights: {
        Row: {
          captured_at: string
          comments: number
          id: string
          likes: number
          period: string
          reach: number
          saved: number
          shares: number
          updated_at: string
          views: number
        }
        Insert: {
          captured_at?: string
          comments?: number
          id: string
          likes?: number
          period?: string
          reach?: number
          saved?: number
          shares?: number
          updated_at?: string
          views?: number
        }
        Update: {
          captured_at?: string
          comments?: number
          id?: string
          likes?: number
          period?: string
          reach?: number
          saved?: number
          shares?: number
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      instagram_post_schedule_links: {
        Row: {
          created_at: string
          id: string
          post_id: string
          schedule_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          schedule_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          schedule_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_post_schedule_links_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "instagram_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_post_schedule_links_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_post_schedule_links_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_post_schedule_links_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      inter_config: {
        Row: {
          ambiente: string
          ca_chain_path: string | null
          certificado_path: string | null
          chave_path: string | null
          client_id: string | null
          client_secret: string | null
          conta_corrente: string | null
          created_at: string
          id: string
          oauth_scope: string | null
          updated_at: string
        }
        Insert: {
          ambiente?: string
          ca_chain_path?: string | null
          certificado_path?: string | null
          chave_path?: string | null
          client_id?: string | null
          client_secret?: string | null
          conta_corrente?: string | null
          created_at?: string
          id?: string
          oauth_scope?: string | null
          updated_at?: string
        }
        Update: {
          ambiente?: string
          ca_chain_path?: string | null
          certificado_path?: string | null
          chave_path?: string | null
          client_id?: string | null
          client_secret?: string | null
          conta_corrente?: string | null
          created_at?: string
          id?: string
          oauth_scope?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inter_oauth_tokens: {
        Row: {
          access_token: string
          config_id: string | null
          created_at: string | null
          expires_at: string
          id: string
        }
        Insert: {
          access_token: string
          config_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
        }
        Update: {
          access_token?: string
          config_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inter_oauth_tokens_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "inter_config"
            referencedColumns: ["id"]
          },
        ]
      }
      logos: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          name: string
          type: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name: string
          type?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      mailing: {
        Row: {
          cidade: string
          created_at: string | null
          id: string
          nome: string
          nome_mailing: string
          telefone: string
        }
        Insert: {
          cidade: string
          created_at?: string | null
          id: string
          nome: string
          nome_mailing: string
          telefone: string
        }
        Update: {
          cidade?: string
          created_at?: string | null
          id?: string
          nome?: string
          nome_mailing?: string
          telefone?: string
        }
        Relationships: []
      }
      mailing_contacts: {
        Row: {
          Cont_erro: number | null
          created_at: string | null
          email: string | null
          id: string
          mailing_id: string | null
          nome: string
          Status: string | null
          telefone: string
        }
        Insert: {
          Cont_erro?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          mailing_id?: string | null
          nome: string
          Status?: string | null
          telefone: string
        }
        Update: {
          Cont_erro?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          mailing_id?: string | null
          nome?: string
          Status?: string | null
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "mailing_contacts_mailing_id_fkey"
            columns: ["mailing_id"]
            isOneToOne: false
            referencedRelation: "mailing"
            referencedColumns: ["id"]
          },
        ]
      }
      maior_valor: {
        Row: {
          atualizado_em: string | null
          id: number
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          id?: number
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          id?: number
          valor?: number
        }
        Relationships: []
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
      marketing_actions: {
        Row: {
          action_type: string
          budget: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          results_summary: string | null
          start_date: string | null
          target_stores: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_type: string
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          results_summary?: string | null
          start_date?: string | null
          target_stores?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          results_summary?: string | null
          start_date?: string | null
          target_stores?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_requests: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          deadline: string | null
          description: string
          id: string
          priority: string | null
          request_type: string
          response: string | null
          status: string | null
          store_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          deadline?: string | null
          description: string
          id?: string
          priority?: string | null
          request_type: string
          response?: string | null
          status?: string | null
          store_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string
          id?: string
          priority?: string | null
          request_type?: string
          response?: string | null
          status?: string | null
          store_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          created_at: string | null
          group_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          page_id: string | null
          parent_id: string | null
          path: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          page_id?: string | null
          parent_id?: string | null
          path: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          page_id?: string | null
          parent_id?: string | null
          path?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "system_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      "ok - BLUEBAY_REPRESENTANTE": {
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
      oni_agencia_abonos: {
        Row: {
          collaborator_id: string
          comprovante_url: string | null
          created_at: string | null
          data: string
          id: string
          justificativa: string | null
          tipo_abono: string
          updated_at: string | null
        }
        Insert: {
          collaborator_id: string
          comprovante_url?: string | null
          created_at?: string | null
          data: string
          id?: string
          justificativa?: string | null
          tipo_abono: string
          updated_at?: string | null
        }
        Update: {
          collaborator_id?: string
          comprovante_url?: string | null
          created_at?: string | null
          data?: string
          id?: string
          justificativa?: string | null
          tipo_abono?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_abonos_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_ausencias: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          collaborator_id: string
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          documento_url: string | null
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_ajuste"] | null
          subtipo: string | null
          tipo: Database["public"]["Enums"]["tipo_ausencia"]
          updated_at: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          collaborator_id: string
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          documento_url?: string | null
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_ajuste"] | null
          subtipo?: string | null
          tipo: Database["public"]["Enums"]["tipo_ausencia"]
          updated_at?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          collaborator_id?: string
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          documento_url?: string | null
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_ajuste"] | null
          subtipo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_ausencia"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_ausencias_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_banco_horas: {
        Row: {
          ano: number
          collaborator_id: string
          compensacao_solicitada: number | null
          created_at: string | null
          horas_devidas: number | null
          horas_extras: number | null
          horas_negativas: number | null
          horas_trabalhadas: number | null
          id: string
          mes: number
          observacoes: string | null
          saldo_anterior: number | null
          saldo_atual: number | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          collaborator_id: string
          compensacao_solicitada?: number | null
          created_at?: string | null
          horas_devidas?: number | null
          horas_extras?: number | null
          horas_negativas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          mes: number
          observacoes?: string | null
          saldo_anterior?: number | null
          saldo_atual?: number | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          collaborator_id?: string
          compensacao_solicitada?: number | null
          created_at?: string | null
          horas_devidas?: number | null
          horas_extras?: number | null
          horas_negativas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          mes?: number
          observacoes?: string | null
          saldo_anterior?: number | null
          saldo_atual?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_banco_horas_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_billing_closures: {
        Row: {
          billing_email_sent_at: string | null
          billing_email_status: Json | null
          boleto_gerado: boolean | null
          boleto_status: string | null
          client_id: string
          closed_at: string
          closed_by: string | null
          created_at: string
          general_discount: number | null
          id: string
          meta_ads_file_path: string | null
          month: number
          nota_fiscal_file_path: string | null
          numero_nota_fiscal: string | null
          numero_rps: string | null
          observation: string | null
          tiktok_ads_file_path: string | null
          tiktok_ads_pix_code: string | null
          total_amount: number
          updated_at: string
          year: number
        }
        Insert: {
          billing_email_sent_at?: string | null
          billing_email_status?: Json | null
          boleto_gerado?: boolean | null
          boleto_status?: string | null
          client_id: string
          closed_at?: string
          closed_by?: string | null
          created_at?: string
          general_discount?: number | null
          id?: string
          meta_ads_file_path?: string | null
          month: number
          nota_fiscal_file_path?: string | null
          numero_nota_fiscal?: string | null
          numero_rps?: string | null
          observation?: string | null
          tiktok_ads_file_path?: string | null
          tiktok_ads_pix_code?: string | null
          total_amount?: number
          updated_at?: string
          year: number
        }
        Update: {
          billing_email_sent_at?: string | null
          billing_email_status?: Json | null
          boleto_gerado?: boolean | null
          boleto_status?: string | null
          client_id?: string
          closed_at?: string
          closed_by?: string | null
          created_at?: string
          general_discount?: number | null
          id?: string
          meta_ads_file_path?: string | null
          month?: number
          nota_fiscal_file_path?: string | null
          numero_nota_fiscal?: string | null
          numero_rps?: string | null
          observation?: string | null
          tiktok_ads_file_path?: string | null
          tiktok_ads_pix_code?: string | null
          total_amount?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_billing_closures_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_boleto_exports: {
        Row: {
          caminho_arquivo: string
          client_id: string
          codigo_cobranca: number
          created_at: string | null
          data_exportacao: string | null
          id: string
          updated_at: string | null
          valor_total: number
        }
        Insert: {
          caminho_arquivo: string
          client_id: string
          codigo_cobranca: number
          created_at?: string | null
          data_exportacao?: string | null
          id?: string
          updated_at?: string | null
          valor_total: number
        }
        Update: {
          caminho_arquivo?: string
          client_id?: string
          codigo_cobranca?: number
          created_at?: string | null
          data_exportacao?: string | null
          id?: string
          updated_at?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_boleto_exports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_capturas: {
        Row: {
          capture_date: string | null
          capture_end_date: string | null
          client_id: string
          collaborator_id: string | null
          created_at: string
          creators: string[] | null
          description: string | null
          editorial_line_id: string | null
          id: string
          is_all_day: boolean | null
          location: string | null
          product_id: string | null
          service_id: string
          status_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capture_date?: string | null
          capture_end_date?: string | null
          client_id: string
          collaborator_id?: string | null
          created_at?: string
          creators?: string[] | null
          description?: string | null
          editorial_line_id?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          product_id?: string | null
          service_id: string
          status_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capture_date?: string | null
          capture_end_date?: string | null
          client_id?: string
          collaborator_id?: string | null
          created_at?: string
          creators?: string[] | null
          description?: string | null
          editorial_line_id?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          product_id?: string | null
          service_id?: string
          status_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_capturas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_client_scopes: {
        Row: {
          client_id: string
          closed_at: string | null
          created_at: string
          discount: number | null
          id: string
          is_closed: boolean | null
          manual_adjustment: number | null
          quantity: number
          service_id: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          closed_at?: string | null
          created_at?: string
          discount?: number | null
          id?: string
          is_closed?: boolean | null
          manual_adjustment?: number | null
          quantity?: number
          service_id: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          closed_at?: string | null
          created_at?: string
          discount?: number | null
          id?: string
          is_closed?: boolean | null
          manual_adjustment?: number | null
          quantity?: number
          service_id?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_client_scopes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_client_scopes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_client_scopes_extra: {
        Row: {
          client_id: string
          closed_at: string | null
          created_at: string
          discount: number | null
          due_date: string | null
          id: string
          is_closed: boolean | null
          manual_adjustment: number | null
          no_charge: boolean
          quantity: number
          responsible_id: string | null
          service_id: string
          status: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          closed_at?: string | null
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          is_closed?: boolean | null
          manual_adjustment?: number | null
          no_charge?: boolean
          quantity?: number
          responsible_id?: string | null
          service_id: string
          status?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          closed_at?: string | null
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          is_closed?: boolean | null
          manual_adjustment?: number | null
          no_charge?: boolean
          quantity?: number
          responsible_id?: string | null
          service_id?: string
          status?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_client_scopes_extra_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_client_scopes_extra_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_client_scopes_extra_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_clients: {
        Row: {
          address: string | null
          aliquota_iss: number | null
          bairro: string | null
          billing_contacts: Json | null
          billing_emails: string[] | null
          cep: string | null
          city: string | null
          cnpj: string | null
          codigo_servico: string | null
          complemento: string | null
          created_at: string
          discriminacao_servicos: string | null
          email: string | null
          id: string
          inscricao_municipal: string | null
          logo_url: string | null
          name: string
          numero: string | null
          phone: string | null
          razao_social: string | null
          serie_rps: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          aliquota_iss?: number | null
          bairro?: string | null
          billing_contacts?: Json | null
          billing_emails?: string[] | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          codigo_servico?: string | null
          complemento?: string | null
          created_at?: string
          discriminacao_servicos?: string | null
          email?: string | null
          id?: string
          inscricao_municipal?: string | null
          logo_url?: string | null
          name: string
          numero?: string | null
          phone?: string | null
          razao_social?: string | null
          serie_rps?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          aliquota_iss?: number | null
          bairro?: string | null
          billing_contacts?: Json | null
          billing_emails?: string[] | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          codigo_servico?: string | null
          complemento?: string | null
          created_at?: string
          discriminacao_servicos?: string | null
          email?: string | null
          id?: string
          inscricao_municipal?: string | null
          logo_url?: string | null
          name?: string
          numero?: string | null
          phone?: string | null
          razao_social?: string | null
          serie_rps?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      oni_agencia_collaborator_status_times: {
        Row: {
          collaborator_id: string
          created_at: string | null
          days_before: number
          id: string
          status_id: string
          updated_at: string | null
        }
        Insert: {
          collaborator_id: string
          created_at?: string | null
          days_before?: number
          id?: string
          status_id: string
          updated_at?: string | null
        }
        Update: {
          collaborator_id?: string
          created_at?: string | null
          days_before?: number
          id?: string
          status_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_collaborator_status_times_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_collaborator_status_times_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_collaborators: {
        Row: {
          ativo: boolean
          banco_horas_ativo: boolean | null
          carga_horaria_diaria: string | null
          carga_horaria_domingo: string | null
          carga_horaria_mensal: number | null
          carga_horaria_sabado: string | null
          carga_horaria_semanal: number | null
          created_at: string
          dias_trabalho: string[] | null
          duracao_minima_almoco: number | null
          email: string | null
          fornecedor_id: string | null
          geo_endereco: string | null
          geo_latitude: number | null
          geo_longitude: number | null
          geo_raio_metros: number | null
          he_extraordinaria_apos: string | null
          horario_almoco_fim: string | null
          horario_almoco_inicio: string | null
          horario_entrada: string | null
          horario_saida: string | null
          id: string
          limite_he_mensal: number | null
          name: string
          permite_banco_horas: boolean | null
          permite_ponto_remoto: boolean | null
          phone: string | null
          photo_url: string | null
          requer_foto_ponto: boolean | null
          requer_justificativa_atraso: boolean | null
          tipo_jornada: Database["public"]["Enums"]["tipo_jornada"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          banco_horas_ativo?: boolean | null
          carga_horaria_diaria?: string | null
          carga_horaria_domingo?: string | null
          carga_horaria_mensal?: number | null
          carga_horaria_sabado?: string | null
          carga_horaria_semanal?: number | null
          created_at?: string
          dias_trabalho?: string[] | null
          duracao_minima_almoco?: number | null
          email?: string | null
          fornecedor_id?: string | null
          geo_endereco?: string | null
          geo_latitude?: number | null
          geo_longitude?: number | null
          geo_raio_metros?: number | null
          he_extraordinaria_apos?: string | null
          horario_almoco_fim?: string | null
          horario_almoco_inicio?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id?: string
          limite_he_mensal?: number | null
          name: string
          permite_banco_horas?: boolean | null
          permite_ponto_remoto?: boolean | null
          phone?: string | null
          photo_url?: string | null
          requer_foto_ponto?: boolean | null
          requer_justificativa_atraso?: boolean | null
          tipo_jornada?: Database["public"]["Enums"]["tipo_jornada"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          banco_horas_ativo?: boolean | null
          carga_horaria_diaria?: string | null
          carga_horaria_domingo?: string | null
          carga_horaria_mensal?: number | null
          carga_horaria_sabado?: string | null
          carga_horaria_semanal?: number | null
          created_at?: string
          dias_trabalho?: string[] | null
          duracao_minima_almoco?: number | null
          email?: string | null
          fornecedor_id?: string | null
          geo_endereco?: string | null
          geo_latitude?: number | null
          geo_longitude?: number | null
          geo_raio_metros?: number | null
          he_extraordinaria_apos?: string | null
          horario_almoco_fim?: string | null
          horario_almoco_inicio?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id?: string
          limite_he_mensal?: number | null
          name?: string
          permite_banco_horas?: boolean | null
          permite_ponto_remoto?: boolean | null
          phone?: string | null
          photo_url?: string | null
          requer_foto_ponto?: boolean | null
          requer_justificativa_atraso?: boolean | null
          tipo_jornada?: Database["public"]["Enums"]["tipo_jornada"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_collaborators_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_content_schedules: {
        Row: {
          caption: string | null
          capture_date: string | null
          capture_end_date: string | null
          channel: string[] | null
          client_id: string
          collaborator_id: string | null
          created_at: string
          creators: string[] | null
          description: string | null
          editorial_line_id: string | null
          execution_phase: string | null
          facebook_location_id: string | null
          facebook_post_id: string | null
          facebook_post_url: string | null
          facebook_reels_cover_path: string | null
          facebook_status: string | null
          facebook_user_tags: Json | null
          google_drive_file_id: string | null
          google_drive_file_path: string | null
          google_drive_thumbnail_url: string | null
          google_drive_webview_link: string | null
          id: string
          instagram_location_id: string | null
          instagram_post_id: string | null
          instagram_post_url: string | null
          instagram_reels_cover_path: string | null
          instagram_status: string | null
          instagram_story_mentions: Json | null
          instagram_user_tags: Json | null
          is_all_day: boolean | null
          location: string | null
          meta_error_message: string | null
          meta_media_url: string | null
          meta_post_id: string | null
          meta_post_status: string | null
          post_format: string | null
          product_id: string | null
          scheduled_date: string
          service_id: string
          status_id: string | null
          tiktok_caption: string | null
          tiktok_error_message: string | null
          tiktok_post_id: string | null
          tiktok_post_url: string | null
          tiktok_status: string | null
          tiktok_video_path: string | null
          title: string
          updated_at: string
          youtube_error_message: string | null
          youtube_post_id: string | null
          youtube_post_status: string | null
          youtube_privacy_status: string | null
          youtube_video_title: string | null
        }
        Insert: {
          caption?: string | null
          capture_date?: string | null
          capture_end_date?: string | null
          channel?: string[] | null
          client_id: string
          collaborator_id?: string | null
          created_at?: string
          creators?: string[] | null
          description?: string | null
          editorial_line_id?: string | null
          execution_phase?: string | null
          facebook_location_id?: string | null
          facebook_post_id?: string | null
          facebook_post_url?: string | null
          facebook_reels_cover_path?: string | null
          facebook_status?: string | null
          facebook_user_tags?: Json | null
          google_drive_file_id?: string | null
          google_drive_file_path?: string | null
          google_drive_thumbnail_url?: string | null
          google_drive_webview_link?: string | null
          id?: string
          instagram_location_id?: string | null
          instagram_post_id?: string | null
          instagram_post_url?: string | null
          instagram_reels_cover_path?: string | null
          instagram_status?: string | null
          instagram_story_mentions?: Json | null
          instagram_user_tags?: Json | null
          is_all_day?: boolean | null
          location?: string | null
          meta_error_message?: string | null
          meta_media_url?: string | null
          meta_post_id?: string | null
          meta_post_status?: string | null
          post_format?: string | null
          product_id?: string | null
          scheduled_date: string
          service_id: string
          status_id?: string | null
          tiktok_caption?: string | null
          tiktok_error_message?: string | null
          tiktok_post_id?: string | null
          tiktok_post_url?: string | null
          tiktok_status?: string | null
          tiktok_video_path?: string | null
          title: string
          updated_at?: string
          youtube_error_message?: string | null
          youtube_post_id?: string | null
          youtube_post_status?: string | null
          youtube_privacy_status?: string | null
          youtube_video_title?: string | null
        }
        Update: {
          caption?: string | null
          capture_date?: string | null
          capture_end_date?: string | null
          channel?: string[] | null
          client_id?: string
          collaborator_id?: string | null
          created_at?: string
          creators?: string[] | null
          description?: string | null
          editorial_line_id?: string | null
          execution_phase?: string | null
          facebook_location_id?: string | null
          facebook_post_id?: string | null
          facebook_post_url?: string | null
          facebook_reels_cover_path?: string | null
          facebook_status?: string | null
          facebook_user_tags?: Json | null
          google_drive_file_id?: string | null
          google_drive_file_path?: string | null
          google_drive_thumbnail_url?: string | null
          google_drive_webview_link?: string | null
          id?: string
          instagram_location_id?: string | null
          instagram_post_id?: string | null
          instagram_post_url?: string | null
          instagram_reels_cover_path?: string | null
          instagram_status?: string | null
          instagram_story_mentions?: Json | null
          instagram_user_tags?: Json | null
          is_all_day?: boolean | null
          location?: string | null
          meta_error_message?: string | null
          meta_media_url?: string | null
          meta_post_id?: string | null
          meta_post_status?: string | null
          post_format?: string | null
          product_id?: string | null
          scheduled_date?: string
          service_id?: string
          status_id?: string | null
          tiktok_caption?: string | null
          tiktok_error_message?: string | null
          tiktok_post_id?: string | null
          tiktok_post_url?: string | null
          tiktok_status?: string | null
          tiktok_video_path?: string | null
          title?: string
          updated_at?: string
          youtube_error_message?: string | null
          youtube_post_id?: string | null
          youtube_post_status?: string | null
          youtube_privacy_status?: string | null
          youtube_video_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_content_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_demandas_extras: {
        Row: {
          client_id: string
          created_at: string
          discount: number | null
          due_date: string | null
          id: string
          manual_adjustment: number | null
          observation: string | null
          quantity: number
          responsible_id: string | null
          service_id: string
          status: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          manual_adjustment?: number | null
          observation?: string | null
          quantity?: number
          responsible_id?: string | null
          service_id: string
          status?: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          discount?: number | null
          due_date?: string | null
          id?: string
          manual_adjustment?: number | null
          observation?: string | null
          quantity?: number
          responsible_id?: string | null
          service_id?: string
          status?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_demandas_extras_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_demandas_extras_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_demandas_extras_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_fechamento_ponto: {
        Row: {
          ano: number
          created_at: string | null
          data_fechamento: string | null
          data_reabertura: string | null
          fechado_por: string | null
          id: string
          mes: number
          motivo_reabertura: string | null
          observacoes: string | null
          reaberto_por: string | null
          status: Database["public"]["Enums"]["status_fechamento"] | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          created_at?: string | null
          data_fechamento?: string | null
          data_reabertura?: string | null
          fechado_por?: string | null
          id?: string
          mes: number
          motivo_reabertura?: string | null
          observacoes?: string | null
          reaberto_por?: string | null
          status?: Database["public"]["Enums"]["status_fechamento"] | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          data_fechamento?: string | null
          data_reabertura?: string | null
          fechado_por?: string | null
          id?: string
          mes?: number
          motivo_reabertura?: string | null
          observacoes?: string | null
          reaberto_por?: string | null
          status?: Database["public"]["Enums"]["status_fechamento"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_feriados: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          created_at: string | null
          data: string
          estado: string | null
          id: string
          nome: string
          obrigatorio: boolean | null
          observacoes: string | null
          recorrente_anualmente: boolean | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          data: string
          estado?: string | null
          id?: string
          nome: string
          obrigatorio?: boolean | null
          observacoes?: string | null
          recorrente_anualmente?: boolean | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          data?: string
          estado?: string | null
          id?: string
          nome?: string
          obrigatorio?: boolean | null
          observacoes?: string | null
          recorrente_anualmente?: boolean | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_google_drive_config: {
        Row: {
          auth_mode: string | null
          client_email: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          private_key: string | null
          project_id: string | null
          root_folder_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_mode?: string | null
          client_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          private_key?: string | null
          project_id?: string | null
          root_folder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_mode?: string | null
          client_email?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          private_key?: string | null
          project_id?: string | null
          root_folder_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_meta_accounts: {
        Row: {
          client_id: string
          created_at: string | null
          facebook_page_access_token: string | null
          facebook_page_id: string | null
          facebook_page_name: string | null
          id: string
          instagram_account_name: string | null
          instagram_business_account_id: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_access_token: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          facebook_page_access_token?: string | null
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          id?: string
          instagram_account_name?: string | null
          instagram_business_account_id?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_access_token: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          facebook_page_access_token?: string | null
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          id?: string
          instagram_account_name?: string | null
          instagram_business_account_id?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_access_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_meta_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_nfs_config: {
        Row: {
          aliquota_iss_padrao: number
          ambiente: string
          bairro_prestador: string
          ccm_prestador: string
          cep_prestador: string
          certificado_filename: string | null
          certificado_pass: string | null
          certificado_path: string | null
          certificado_tipo:
            | Database["public"]["Enums"]["certificado_tipo_enum"]
            | null
          certificado_uploaded_at: string | null
          cidade_prestador: string
          cnpj_prestador: string
          codigo_atividade: string
          complemento_prestador: string | null
          created_at: string
          descricao_atividade: string
          discriminacao_padrao: string
          email_prestador: string | null
          endereco_prestador: string
          id: string
          is_active: boolean
          numero_lote_atual: number
          numero_prestador: string
          observacoes: string | null
          razao_social: string
          serie_rps_padrao: string
          telefone_prestador: string | null
          uf_prestador: string
          updated_at: string
          url_prefeitura: string | null
          url_prefeitura_hml: string | null
        }
        Insert: {
          aliquota_iss_padrao?: number
          ambiente?: string
          bairro_prestador: string
          ccm_prestador: string
          cep_prestador: string
          certificado_filename?: string | null
          certificado_pass?: string | null
          certificado_path?: string | null
          certificado_tipo?:
            | Database["public"]["Enums"]["certificado_tipo_enum"]
            | null
          certificado_uploaded_at?: string | null
          cidade_prestador: string
          cnpj_prestador: string
          codigo_atividade?: string
          complemento_prestador?: string | null
          created_at?: string
          descricao_atividade?: string
          discriminacao_padrao?: string
          email_prestador?: string | null
          endereco_prestador: string
          id?: string
          is_active?: boolean
          numero_lote_atual?: number
          numero_prestador: string
          observacoes?: string | null
          razao_social: string
          serie_rps_padrao?: string
          telefone_prestador?: string | null
          uf_prestador: string
          updated_at?: string
          url_prefeitura?: string | null
          url_prefeitura_hml?: string | null
        }
        Update: {
          aliquota_iss_padrao?: number
          ambiente?: string
          bairro_prestador?: string
          ccm_prestador?: string
          cep_prestador?: string
          certificado_filename?: string | null
          certificado_pass?: string | null
          certificado_path?: string | null
          certificado_tipo?:
            | Database["public"]["Enums"]["certificado_tipo_enum"]
            | null
          certificado_uploaded_at?: string | null
          cidade_prestador?: string
          cnpj_prestador?: string
          codigo_atividade?: string
          complemento_prestador?: string | null
          created_at?: string
          descricao_atividade?: string
          discriminacao_padrao?: string
          email_prestador?: string | null
          endereco_prestador?: string
          id?: string
          is_active?: boolean
          numero_lote_atual?: number
          numero_prestador?: string
          observacoes?: string | null
          razao_social?: string
          serie_rps_padrao?: string
          telefone_prestador?: string | null
          uf_prestador?: string
          updated_at?: string
          url_prefeitura?: string | null
          url_prefeitura_hml?: string | null
        }
        Relationships: []
      }
      oni_agencia_nfse_certificates: {
        Row: {
          certificado_filename: string
          certificado_path: string
          certificado_tipo: Database["public"]["Enums"]["certificado_tipo_enum"]
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          certificado_filename: string
          certificado_path: string
          certificado_tipo: Database["public"]["Enums"]["certificado_tipo_enum"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          certificado_filename?: string
          certificado_path?: string
          certificado_tipo?: Database["public"]["Enums"]["certificado_tipo_enum"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_nfse_config: {
        Row: {
          certificado_filename: string | null
          certificado_pass: string | null
          certificado_path: string | null
          certificado_tipo: string
          certificado_uploaded_at: string | null
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          url_prefeitura: string | null
        }
        Insert: {
          certificado_filename?: string | null
          certificado_pass?: string | null
          certificado_path?: string | null
          certificado_tipo?: string
          certificado_uploaded_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          url_prefeitura?: string | null
        }
        Update: {
          certificado_filename?: string | null
          certificado_pass?: string | null
          certificado_path?: string | null
          certificado_tipo?: string
          certificado_uploaded_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          url_prefeitura?: string | null
        }
        Relationships: []
      }
      oni_agencia_nfse_historico: {
        Row: {
          ambiente: string
          client_id: string
          codigo_verificacao: string | null
          created_at: string
          data_emissao: string
          id: string
          lote_id: string
          numero_nfse: string | null
          periodo_fim: string
          periodo_inicio: string
          quantidade_rps: number
          status: string
          updated_at: string
          valor_total: number
          xml_response: string
        }
        Insert: {
          ambiente?: string
          client_id: string
          codigo_verificacao?: string | null
          created_at?: string
          data_emissao: string
          id?: string
          lote_id: string
          numero_nfse?: string | null
          periodo_fim: string
          periodo_inicio: string
          quantidade_rps: number
          status?: string
          updated_at?: string
          valor_total: number
          xml_response: string
        }
        Update: {
          ambiente?: string
          client_id?: string
          codigo_verificacao?: string | null
          created_at?: string
          data_emissao?: string
          id?: string
          lote_id?: string
          numero_nfse?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          quantidade_rps?: number
          status?: string
          updated_at?: string
          valor_total?: number
          xml_response?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_oni_nfse_historico_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_nfse_itens: {
        Row: {
          aliquota_iss: number
          cliente_id: string
          codigo_servico: string
          created_at: string
          data_emissao: string
          discriminacao: string
          id: string
          lote_id: string
          nfse_numero: string | null
          rps_numero: number
          serie: string
          status: string
          tomador_bairro: string | null
          tomador_cep: string | null
          tomador_cidade: string | null
          tomador_cnpj: string
          tomador_endereco: string | null
          tomador_nome: string
          tomador_uf: string | null
          updated_at: string
          valor_servicos: number
        }
        Insert: {
          aliquota_iss: number
          cliente_id: string
          codigo_servico: string
          created_at?: string
          data_emissao: string
          discriminacao: string
          id?: string
          lote_id: string
          nfse_numero?: string | null
          rps_numero: number
          serie: string
          status?: string
          tomador_bairro?: string | null
          tomador_cep?: string | null
          tomador_cidade?: string | null
          tomador_cnpj: string
          tomador_endereco?: string | null
          tomador_nome: string
          tomador_uf?: string | null
          updated_at?: string
          valor_servicos: number
        }
        Update: {
          aliquota_iss?: number
          cliente_id?: string
          codigo_servico?: string
          created_at?: string
          data_emissao?: string
          discriminacao?: string
          id?: string
          lote_id?: string
          nfse_numero?: string | null
          rps_numero?: number
          serie?: string
          status?: string
          tomador_bairro?: string | null
          tomador_cep?: string | null
          tomador_cidade?: string | null
          tomador_cnpj?: string
          tomador_endereco?: string | null
          tomador_nome?: string
          tomador_uf?: string | null
          updated_at?: string
          valor_servicos?: number
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_nfse_itens_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_nfse_itens_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_nfse_lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_nfse_lotes: {
        Row: {
          ambiente: string
          codigo_verificacao: string | null
          created_at: string
          id: string
          numero_lote: number
          numero_nfse: string | null
          periodo_fim: string
          periodo_inicio: string
          prestador_ccm: string
          status: string
          updated_at: string
          xml_response: string | null
        }
        Insert: {
          ambiente: string
          codigo_verificacao?: string | null
          created_at?: string
          id?: string
          numero_lote: number
          numero_nfse?: string | null
          periodo_fim: string
          periodo_inicio: string
          prestador_ccm: string
          status?: string
          updated_at?: string
          xml_response?: string | null
        }
        Update: {
          ambiente?: string
          codigo_verificacao?: string | null
          created_at?: string
          id?: string
          numero_lote?: number
          numero_nfse?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          prestador_ccm?: string
          status?: string
          updated_at?: string
          xml_response?: string | null
        }
        Relationships: []
      }
      oni_agencia_outside_scope_monthly_adjustments: {
        Row: {
          client_id: string
          created_at: string
          discount: number | null
          id: string
          manual_adjustment: number | null
          month: number
          no_charge: boolean
          service_id: string
          unit_price: number | null
          updated_at: string
          year: number
        }
        Insert: {
          client_id: string
          created_at?: string
          discount?: number | null
          id?: string
          manual_adjustment?: number | null
          month: number
          no_charge?: boolean
          service_id: string
          unit_price?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          client_id?: string
          created_at?: string
          discount?: number | null
          id?: string
          manual_adjustment?: number | null
          month?: number
          no_charge?: boolean
          service_id?: string
          unit_price?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_outside_scope_monthly_adjustments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_outside_scope_monthly_adjustments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_outside_scope_services: {
        Row: {
          client_id: string
          created_at: string
          discount: number | null
          id: string
          manual_adjustment: number | null
          month: number
          service_id: string
          unit_price: number | null
          updated_at: string
          year: number
        }
        Insert: {
          client_id: string
          created_at?: string
          discount?: number | null
          id?: string
          manual_adjustment?: number | null
          month: number
          service_id: string
          unit_price?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          client_id?: string
          created_at?: string
          discount?: number | null
          id?: string
          manual_adjustment?: number | null
          month?: number
          service_id?: string
          unit_price?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_outside_scope_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_outside_scope_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_registros_ponto: {
        Row: {
          ajustado_em: string | null
          ajustado_por: string | null
          collaborator_id: string
          created_at: string | null
          created_by: string | null
          data: string
          dentro_perimetro: boolean | null
          dispositivo: string | null
          foto_url: string | null
          geo_latitude: number | null
          geo_longitude: number | null
          hora: string
          id: string
          ip_address: unknown
          justificativa: string | null
          observacoes: string | null
          requer_ajuste: boolean | null
          status: Database["public"]["Enums"]["status_registro_ponto"] | null
          tipo_registro: Database["public"]["Enums"]["tipo_registro_ponto"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ajustado_em?: string | null
          ajustado_por?: string | null
          collaborator_id: string
          created_at?: string | null
          created_by?: string | null
          data: string
          dentro_perimetro?: boolean | null
          dispositivo?: string | null
          foto_url?: string | null
          geo_latitude?: number | null
          geo_longitude?: number | null
          hora: string
          id?: string
          ip_address?: unknown
          justificativa?: string | null
          observacoes?: string | null
          requer_ajuste?: boolean | null
          status?: Database["public"]["Enums"]["status_registro_ponto"] | null
          tipo_registro: Database["public"]["Enums"]["tipo_registro_ponto"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ajustado_em?: string | null
          ajustado_por?: string | null
          collaborator_id?: string
          created_at?: string | null
          created_by?: string | null
          data?: string
          dentro_perimetro?: boolean | null
          dispositivo?: string | null
          foto_url?: string | null
          geo_latitude?: number | null
          geo_longitude?: number | null
          hora?: string
          id?: string
          ip_address?: unknown
          justificativa?: string | null
          observacoes?: string | null
          requer_ajuste?: boolean | null
          status?: Database["public"]["Enums"]["status_registro_ponto"] | null
          tipo_registro?: Database["public"]["Enums"]["tipo_registro_ponto"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_registros_ponto_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_rps_control: {
        Row: {
          created_at: string | null
          id: string
          ultimo_numero_rps: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ultimo_numero_rps?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ultimo_numero_rps?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_schedule_comments: {
        Row: {
          author_id: string | null
          author_name: string
          comment_text: string
          created_at: string
          id: string
          schedule_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          comment_text: string
          created_at?: string
          id?: string
          schedule_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          comment_text?: string
          created_at?: string
          id?: string
          schedule_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_schedule_comments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_comments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_comments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_schedule_history: {
        Row: {
          changed_by: string | null
          changed_by_name: string | null
          created_at: string
          field_name: string
          id: string
          new_value: string
          old_value: string | null
          schedule_id: string
        }
        Insert: {
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          field_name: string
          id?: string
          new_value: string
          old_value?: string | null
          schedule_id: string
        }
        Update: {
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string
          old_value?: string | null
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_schedule_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_schedule_links: {
        Row: {
          capture_id: string
          created_at: string
          description: string | null
          id: string
          schedule_id: string
          updated_at: string
        }
        Insert: {
          capture_id: string
          created_at?: string
          description?: string | null
          id?: string
          schedule_id: string
          updated_at?: string
        }
        Update: {
          capture_id?: string
          created_at?: string
          description?: string | null
          id?: string
          schedule_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_schedule_links_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_capturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_links_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_capturas_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_links_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["capture_id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_links_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_links_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_links_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_scope_monthly_adjustments: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          discount: number | null
          id: string
          manual_adjustment: number | null
          month: number
          no_charge: boolean | null
          service_id: string
          unit_price: number | null
          updated_at: string
          year: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          discount?: number | null
          id?: string
          manual_adjustment?: number | null
          month: number
          no_charge?: boolean | null
          service_id: string
          unit_price?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          discount?: number | null
          id?: string
          manual_adjustment?: number | null
          month?: number
          no_charge?: boolean | null
          service_id?: string
          unit_price?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_scopes: {
        Row: {
          client_id: string
          created_at: string
          id: string
          month: number
          quantity: number
          service_name: string
          unit_price: number
          updated_at: string
          year: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          month: number
          quantity?: number
          service_name: string
          unit_price?: number
          updated_at?: string
          year: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          month?: number
          quantity?: number
          service_name?: string
          unit_price?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_scopes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_services: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      oni_agencia_solicitacoes_ajuste_ponto: {
        Row: {
          anexo_url: string | null
          aprovado_em: string | null
          aprovado_por: string | null
          collaborator_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          data_registro: string | null
          data_solicitacao: string | null
          hora_solicitada: string | null
          id: string
          justificativa: string
          observacoes_aprovador: string | null
          registro_ponto_id: string | null
          status: Database["public"]["Enums"]["status_ajuste"] | null
          tipo_abono: string | null
          tipo_ajuste: Database["public"]["Enums"]["tipo_ajuste_ponto"]
          tipo_registro:
            | Database["public"]["Enums"]["tipo_registro_ponto"]
            | null
          updated_at: string | null
        }
        Insert: {
          anexo_url?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          collaborator_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_registro?: string | null
          data_solicitacao?: string | null
          hora_solicitada?: string | null
          id?: string
          justificativa: string
          observacoes_aprovador?: string | null
          registro_ponto_id?: string | null
          status?: Database["public"]["Enums"]["status_ajuste"] | null
          tipo_abono?: string | null
          tipo_ajuste: Database["public"]["Enums"]["tipo_ajuste_ponto"]
          tipo_registro?:
            | Database["public"]["Enums"]["tipo_registro_ponto"]
            | null
          updated_at?: string | null
        }
        Update: {
          anexo_url?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          collaborator_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_registro?: string | null
          data_solicitacao?: string | null
          hora_solicitada?: string | null
          id?: string
          justificativa?: string
          observacoes_aprovador?: string | null
          registro_ponto_id?: string | null
          status?: Database["public"]["Enums"]["status_ajuste"] | null
          tipo_abono?: string | null
          tipo_ajuste?: Database["public"]["Enums"]["tipo_ajuste_ponto"]
          tipo_registro?:
            | Database["public"]["Enums"]["tipo_registro_ponto"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_solicitacoes_ajuste_ponto_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_solicitacoes_ajuste_ponto_registro_ponto_id_fkey"
            columns: ["registro_ponto_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_registros_ponto"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_status: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          next_status_id: string | null
          previous_status_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          next_status_id?: string | null
          previous_status_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          next_status_id?: string | null
          previous_status_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_status_next_status_id_fkey"
            columns: ["next_status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_status_previous_status_id_fkey"
            columns: ["previous_status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_status_stores: {
        Row: {
          api_key: string
          cidade: string
          created_at: string | null
          id: string
          is_active: boolean | null
          nome_instancia: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          cidade: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nome_instancia: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          cidade?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nome_instancia?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_status_uploads: {
        Row: {
          created_at: string | null
          file_type: string
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_type: string
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_type?: string
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_status_user_stores: {
        Row: {
          created_at: string | null
          id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_status_user_stores_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_tiktok_accounts: {
        Row: {
          access_token: string
          client_id: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          tiktok_handle: string | null
          tiktok_user_id: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          client_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          tiktok_handle?: string | null
          tiktok_user_id: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          client_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          tiktok_handle?: string | null
          tiktok_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_tiktok_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_youtube_accounts: {
        Row: {
          access_token: string
          channel_id: string | null
          channel_name: string | null
          channel_thumbnail_url: string | null
          client_id: string
          created_at: string | null
          expiry_date: number | null
          id: string
          refresh_token: string
          scope: string | null
          token_type: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          channel_id?: string | null
          channel_name?: string | null
          channel_thumbnail_url?: string | null
          client_id: string
          created_at?: string | null
          expiry_date?: number | null
          id?: string
          refresh_token: string
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          channel_id?: string | null
          channel_name?: string | null
          channel_thumbnail_url?: string | null
          client_id?: string
          created_at?: string | null
          expiry_date?: number | null
          id?: string
          refresh_token?: string
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_youtube_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_benefits_daily_overrides: {
        Row: {
          collaborator_id: string
          created_at: string | null
          date: string
          id: string
          is_home_office: boolean
          updated_at: string | null
        }
        Insert: {
          collaborator_id: string
          created_at?: string | null
          date: string
          id?: string
          is_home_office?: boolean
          updated_at?: string | null
        }
        Update: {
          collaborator_id?: string
          created_at?: string | null
          date?: string
          id?: string
          is_home_office?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_benefits_daily_overrides_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_benefits_settings: {
        Row: {
          id: string
          updated_at: string | null
          vr_daily_value: number | null
          vt_daily_value: number | null
        }
        Insert: {
          id?: string
          updated_at?: string | null
          vr_daily_value?: number | null
          vt_daily_value?: number | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          vr_daily_value?: number | null
          vt_daily_value?: number | null
        }
        Relationships: []
      }
      oni_collaborator_benefits_prefs: {
        Row: {
          calculate_benefits: boolean | null
          collaborator_id: string
          created_at: string | null
          home_office_days: string[] | null
          id: string
          updated_at: string | null
          vt_value: number | null
        }
        Insert: {
          calculate_benefits?: boolean | null
          collaborator_id: string
          created_at?: string | null
          home_office_days?: string[] | null
          id?: string
          updated_at?: string | null
          vt_value?: number | null
        }
        Update: {
          calculate_benefits?: boolean | null
          collaborator_id?: string
          created_at?: string | null
          home_office_days?: string[] | null
          id?: string
          updated_at?: string | null
          vt_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_collaborator_benefits_prefs_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: true
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_financial_accounts: {
        Row: {
          balance: number | null
          collaborator_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          collaborator_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          collaborator_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      oni_financial_loans: {
        Row: {
          collaborator_id: string
          created_at: string | null
          description: string | null
          id: string
          installments_count: number
          installments_paid: number
          remaining_balance: number | null
          status: string | null
          total_amount: number
        }
        Insert: {
          collaborator_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          installments_count?: number
          installments_paid?: number
          remaining_balance?: number | null
          status?: string | null
          total_amount: number
        }
        Update: {
          collaborator_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          installments_count?: number
          installments_paid?: number
          remaining_balance?: number | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "oni_financial_loans_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_financial_transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          reference_month: number | null
          reference_year: number | null
          type: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          reference_month?: number | null
          reference_year?: number | null
          type: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          reference_month?: number | null
          reference_year?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_financial_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "oni_financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_payroll_closings: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string | null
          id: string
          month: number
          status: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          id?: string
          month: number
          status?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string | null
          id?: string
          month?: number
          status?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      oni_payroll_items: {
        Row: {
          advance_deduction: number | null
          closing_id: string | null
          collaborator_id: string
          created_at: string | null
          culture_voucher_value: number | null
          daily_bonus: number | null
          id: string
          individual_prize: number | null
          meal_voucher_value: number | null
          other_discounts: number | null
          salary_gross: number | null
          salary_liquid: number | null
          signed_at: string | null
          signed_by_collaborator: boolean | null
          transport_voucher_value: number | null
          updated_at: string | null
        }
        Insert: {
          advance_deduction?: number | null
          closing_id?: string | null
          collaborator_id: string
          created_at?: string | null
          culture_voucher_value?: number | null
          daily_bonus?: number | null
          id?: string
          individual_prize?: number | null
          meal_voucher_value?: number | null
          other_discounts?: number | null
          salary_gross?: number | null
          salary_liquid?: number | null
          signed_at?: string | null
          signed_by_collaborator?: boolean | null
          transport_voucher_value?: number | null
          updated_at?: string | null
        }
        Update: {
          advance_deduction?: number | null
          closing_id?: string | null
          collaborator_id?: string
          created_at?: string | null
          culture_voucher_value?: number | null
          daily_bonus?: number | null
          id?: string
          individual_prize?: number | null
          meal_voucher_value?: number | null
          other_discounts?: number | null
          salary_gross?: number | null
          salary_liquid?: number | null
          signed_at?: string | null
          signed_by_collaborator?: boolean | null
          transport_voucher_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_payroll_items_closing_id_fkey"
            columns: ["closing_id"]
            isOneToOne: false
            referencedRelation: "oni_payroll_closings"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_vacations: {
        Row: {
          collaborator_id: string
          created_at: string | null
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          collaborator_id: string
          created_at?: string | null
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          collaborator_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      oniagencia_capturas: {
        Row: {
          capture_date: string | null
          capture_end_date: string | null
          collaborator_id: string | null
          content_schedule_id: string
          created_at: string
          creators: string[] | null
          description: string | null
          id: string
          is_all_day: boolean | null
          location: string | null
          status_id: string | null
          updated_at: string
        }
        Insert: {
          capture_date?: string | null
          capture_end_date?: string | null
          collaborator_id?: string | null
          content_schedule_id: string
          created_at?: string
          creators?: string[] | null
          description?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          status_id?: string | null
          updated_at?: string
        }
        Update: {
          capture_date?: string | null
          capture_end_date?: string | null
          collaborator_id?: string | null
          content_schedule_id?: string
          created_at?: string
          creators?: string[] | null
          description?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          status_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oniagencia_capturas_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oniagencia_capturas_content_schedule_id_fkey"
            columns: ["content_schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oniagencia_capturas_content_schedule_id_fkey"
            columns: ["content_schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oniagencia_capturas_content_schedule_id_fkey"
            columns: ["content_schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oniagencia_capturas_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos_efetuados: {
        Row: {
          codigo_confirmacao: string | null
          conta_pagar_id: string
          created_at: string | null
          data_pagamento: string
          efetuado_por: string | null
          id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          protocolo_banco: string | null
          response_api: Json | null
          status_transacao: string | null
          taxa_bancaria: number | null
          valor_pago: number
        }
        Insert: {
          codigo_confirmacao?: string | null
          conta_pagar_id: string
          created_at?: string | null
          data_pagamento: string
          efetuado_por?: string | null
          id?: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          protocolo_banco?: string | null
          response_api?: Json | null
          status_transacao?: string | null
          taxa_bancaria?: number | null
          valor_pago: number
        }
        Update: {
          codigo_confirmacao?: string | null
          conta_pagar_id?: string
          created_at?: string | null
          data_pagamento?: string
          efetuado_por?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"]
          protocolo_banco?: string | null
          response_api?: Json | null
          status_transacao?: string | null
          taxa_bancaria?: number | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_efetuados_conta_pagar_id_fkey"
            columns: ["conta_pagar_id"]
            isOneToOne: false
            referencedRelation: "contas_a_pagar"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_anexos: {
        Row: {
          created_at: string | null
          created_by: string | null
          empresa_id: string
          equipamento_id: string | null
          id: string
          manutencao_id: string | null
          nome_arquivo: string
          nota_fiscal_id: string | null
          tamanho_bytes: number | null
          tipo: string
          url_arquivo: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          empresa_id: string
          equipamento_id?: string | null
          id?: string
          manutencao_id?: string | null
          nome_arquivo: string
          nota_fiscal_id?: string | null
          tamanho_bytes?: number | null
          tipo: string
          url_arquivo: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          empresa_id?: string
          equipamento_id?: string | null
          id?: string
          manutencao_id?: string | null
          nome_arquivo?: string
          nota_fiscal_id?: string | null
          tamanho_bytes?: number | null
          tipo?: string
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_anexos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_anexos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_anexos_manutencao_id_fkey"
            columns: ["manutencao_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_manutencoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_anexos_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_audit_log: {
        Row: {
          acao: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          empresa_id: string
          id: string
          ip_address: unknown
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          empresa_id: string
          id?: string
          ip_address?: unknown
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          empresa_id?: string
          id?: string
          ip_address?: unknown
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_audit_log_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_categorias: {
        Row: {
          ativo: boolean | null
          campos_customizados: Json | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          empresa_id: string | null
          icone: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          campos_customizados?: Json | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          icone?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          campos_customizados?: Json | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          icone?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_categorias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_componentes: {
        Row: {
          created_at: string | null
          descricao: string
          equipamento_id: string
          especificacoes: Json | null
          id: string
          numero_serie: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          equipamento_id: string
          especificacoes?: Json | null
          id?: string
          numero_serie?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          equipamento_id?: string
          especificacoes?: Json | null
          id?: string
          numero_serie?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_componentes_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_empresas: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patrimonio_equipamentos: {
        Row: {
          categoria_id: string | null
          codigo_interno: string
          created_at: string | null
          created_by: string | null
          data_aquisicao: string | null
          data_fim_aluguel: string | null
          data_inicio_aluguel: string | null
          depreciacao_mensal: number | null
          descricao: string | null
          empresa_id: string
          fornecedor_aluguel_id: string | null
          fornecedor_id: string | null
          foto_url: string | null
          garantia_fim: string | null
          garantia_inicio: string | null
          id: string
          ip_address: string | null
          localizacao_id: string | null
          mac_address: string | null
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          situacao: string
          tipo_posse: string
          tipo_rede: string | null
          updated_at: string | null
          updated_by: string | null
          valor_aquisicao: number | null
          valor_mensal_aluguel: number | null
          valor_residual: number | null
          vida_util_meses: number | null
        }
        Insert: {
          categoria_id?: string | null
          codigo_interno: string
          created_at?: string | null
          created_by?: string | null
          data_aquisicao?: string | null
          data_fim_aluguel?: string | null
          data_inicio_aluguel?: string | null
          depreciacao_mensal?: number | null
          descricao?: string | null
          empresa_id: string
          fornecedor_aluguel_id?: string | null
          fornecedor_id?: string | null
          foto_url?: string | null
          garantia_fim?: string | null
          garantia_inicio?: string | null
          id?: string
          ip_address?: string | null
          localizacao_id?: string | null
          mac_address?: string | null
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          situacao?: string
          tipo_posse?: string
          tipo_rede?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_aquisicao?: number | null
          valor_mensal_aluguel?: number | null
          valor_residual?: number | null
          vida_util_meses?: number | null
        }
        Update: {
          categoria_id?: string | null
          codigo_interno?: string
          created_at?: string | null
          created_by?: string | null
          data_aquisicao?: string | null
          data_fim_aluguel?: string | null
          data_inicio_aluguel?: string | null
          depreciacao_mensal?: number | null
          descricao?: string | null
          empresa_id?: string
          fornecedor_aluguel_id?: string | null
          fornecedor_id?: string | null
          foto_url?: string | null
          garantia_fim?: string | null
          garantia_inicio?: string | null
          id?: string
          ip_address?: string | null
          localizacao_id?: string | null
          mac_address?: string | null
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          situacao?: string
          tipo_posse?: string
          tipo_rede?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_aquisicao?: number | null
          valor_mensal_aluguel?: number | null
          valor_residual?: number | null
          vida_util_meses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_equipamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_equipamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_equipamentos_fornecedor_aluguel_id_fkey"
            columns: ["fornecedor_aluguel_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_equipamentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_equipamentos_localizacao_id_fkey"
            columns: ["localizacao_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_localizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_equipamentos_notas: {
        Row: {
          created_at: string | null
          equipamento_id: string
          id: string
          nota_fiscal_id: string
        }
        Insert: {
          created_at?: string | null
          equipamento_id: string
          id?: string
          nota_fiscal_id: string
        }
        Update: {
          created_at?: string | null
          equipamento_id?: string
          id?: string
          nota_fiscal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_equipamentos_notas_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_equipamentos_notas_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_fornecedores: {
        Row: {
          ativo: boolean | null
          cnpj_cpf: string | null
          created_at: string | null
          email: string | null
          empresa_id: string
          endereco: string | null
          id: string
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj_cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id: string
          endereco?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj_cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_localizacoes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          parent_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          parent_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          parent_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_localizacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_localizacoes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_localizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_manutencoes: {
        Row: {
          created_at: string | null
          created_by: string | null
          custo: number | null
          data_manutencao: string
          descricao: string
          equipamento_id: string
          fornecedor_id: string | null
          id: string
          nota_fiscal_id: string | null
          proxima_manutencao: string | null
          status: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custo?: number | null
          data_manutencao: string
          descricao: string
          equipamento_id: string
          fornecedor_id?: string | null
          id?: string
          nota_fiscal_id?: string | null
          proxima_manutencao?: string | null
          status?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custo?: number | null
          data_manutencao?: string
          descricao?: string
          equipamento_id?: string
          fornecedor_id?: string | null
          id?: string
          nota_fiscal_id?: string | null
          proxima_manutencao?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_manutencoes_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_manutencoes_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_manutencoes_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_notas_fiscais: {
        Row: {
          arquivo_url: string | null
          created_at: string | null
          data_emissao: string | null
          empresa_id: string
          fornecedor_id: string | null
          id: string
          numero: string
          observacao: string | null
          serie: string | null
          tipo: string | null
          updated_at: string | null
          valor_total: number | null
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string | null
          data_emissao?: string | null
          empresa_id: string
          fornecedor_id?: string | null
          id?: string
          numero: string
          observacao?: string | null
          serie?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string | null
          data_emissao?: string | null
          empresa_id?: string
          fornecedor_id?: string | null
          id?: string
          numero?: string
          observacao?: string | null
          serie?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_notas_fiscais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_notas_fiscais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_responsaveis: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          equipamento_id: string
          id: string
          localizacao_anterior_id: string | null
          localizacao_nova_id: string | null
          nome_responsavel: string | null
          observacao: string | null
          termo_responsabilidade_url: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          equipamento_id: string
          id?: string
          localizacao_anterior_id?: string | null
          localizacao_nova_id?: string | null
          nome_responsavel?: string | null
          observacao?: string | null
          termo_responsabilidade_url?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          equipamento_id?: string
          id?: string
          localizacao_anterior_id?: string | null
          localizacao_nova_id?: string | null
          nome_responsavel?: string | null
          observacao?: string | null
          termo_responsabilidade_url?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_responsaveis_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_responsaveis_localizacao_anterior_id_fkey"
            columns: ["localizacao_anterior_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_localizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_responsaveis_localizacao_nova_id_fkey"
            columns: ["localizacao_nova_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_localizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonio_responsaveis_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_software: {
        Row: {
          chave_licenca: string | null
          created_at: string
          data_validade: string | null
          equipamento_id: string
          id: string
          nome: string
          observacao: string | null
          tipo_licenca: string | null
          updated_at: string
          versao: string | null
        }
        Insert: {
          chave_licenca?: string | null
          created_at?: string
          data_validade?: string | null
          equipamento_id: string
          id?: string
          nome: string
          observacao?: string | null
          tipo_licenca?: string | null
          updated_at?: string
          versao?: string | null
        }
        Update: {
          chave_licenca?: string | null
          created_at?: string
          data_validade?: string | null
          equipamento_id?: string
          id?: string
          nome?: string
          observacao?: string | null
          tipo_licenca?: string | null
          updated_at?: string
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_software_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_softwares: {
        Row: {
          chave_licenca: string | null
          created_at: string | null
          data_validade: string | null
          equipamento_id: string
          id: string
          nome: string
          observacao: string | null
          tipo_licenca: string | null
          updated_at: string | null
          versao: string | null
        }
        Insert: {
          chave_licenca?: string | null
          created_at?: string | null
          data_validade?: string | null
          equipamento_id: string
          id?: string
          nome: string
          observacao?: string | null
          tipo_licenca?: string | null
          updated_at?: string | null
          versao?: string | null
        }
        Update: {
          chave_licenca?: string | null
          created_at?: string | null
          data_validade?: string | null
          equipamento_id?: string
          id?: string
          nome?: string
          observacao?: string | null
          tipo_licenca?: string | null
          updated_at?: string | null
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_softwares_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio_usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          empresa_id: string
          id: string
          nome: string
          perfil: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          empresa_id: string
          id?: string
          nome: string
          perfil?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          empresa_id?: string
          id?: string
          nome?: string
          perfil?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonio_usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "patrimonio_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      post_lojistas: {
        Row: {
          created_at: string
          id: string
          instagram: string | null
          lojista_contato: string | null
          lojista_nome: string
          observacoes: string | null
          post_id: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instagram?: string | null
          lojista_contato?: string | null
          lojista_nome: string
          observacoes?: string | null
          post_id: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instagram?: string | null
          lojista_contato?: string | null
          lojista_nome?: string
          observacoes?: string | null
          post_id?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reembolso_faturas: {
        Row: {
          boleto_pdf_url: string | null
          cliente_id: string
          created_at: string | null
          data_emissao: string | null
          email_enviado: boolean | null
          id: string
          relatorio_pdf_url: string | null
          status: Database["public"]["Enums"]["reembolso_fatura_status"] | null
          updated_at: string | null
          valor_total: number
        }
        Insert: {
          boleto_pdf_url?: string | null
          cliente_id: string
          created_at?: string | null
          data_emissao?: string | null
          email_enviado?: boolean | null
          id?: string
          relatorio_pdf_url?: string | null
          status?: Database["public"]["Enums"]["reembolso_fatura_status"] | null
          updated_at?: string | null
          valor_total: number
        }
        Update: {
          boleto_pdf_url?: string | null
          cliente_id?: string
          created_at?: string | null
          data_emissao?: string | null
          email_enviado?: boolean | null
          id?: string
          relatorio_pdf_url?: string | null
          status?: Database["public"]["Enums"]["reembolso_fatura_status"] | null
          updated_at?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reembolso_faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reembolso_lotes: {
        Row: {
          acrescimo_nota: number | null
          boleto_url: string | null
          cliente_id: string
          created_at: string | null
          data_fechamento: string | null
          fatura_id: string | null
          id: string
          nfse_url: string | null
          numero_nfse: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["reembolso_lote_status"] | null
          updated_at: string | null
          valor_original: number
          valor_total: number
        }
        Insert: {
          acrescimo_nota?: number | null
          boleto_url?: string | null
          cliente_id: string
          created_at?: string | null
          data_fechamento?: string | null
          fatura_id?: string | null
          id?: string
          nfse_url?: string | null
          numero_nfse?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["reembolso_lote_status"] | null
          updated_at?: string | null
          valor_original: number
          valor_total: number
        }
        Update: {
          acrescimo_nota?: number | null
          boleto_url?: string | null
          cliente_id?: string
          created_at?: string | null
          data_fechamento?: string | null
          fatura_id?: string | null
          id?: string
          nfse_url?: string | null
          numero_nfse?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["reembolso_lote_status"] | null
          updated_at?: string | null
          valor_original?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reembolso_lotes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reembolso_lotes_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "reembolso_faturas"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      Seguidores_Clientes: {
        Row: {
          cliente: string
          data: string
          seguidores: number
        }
        Insert: {
          cliente: string
          data: string
          seguidores: number
        }
        Update: {
          cliente?: string
          data?: string
          seguidores?: number
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          created_at: string | null
          description: string | null
          favicon_url: string | null
          id: string | null
          keywords: string | null
          og_image: string | null
          page_path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          id?: string | null
          keywords?: string | null
          og_image?: string | null
          page_path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          id?: string | null
          keywords?: string | null
          og_image?: string | null
          page_path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      separacao_itens: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          item_codigo: string
          pedido: string
          quantidade_pedida: number
          separacao_id: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          item_codigo: string
          pedido: string
          quantidade_pedida: number
          separacao_id: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          item_codigo?: string
          pedido?: string
          quantidade_pedida?: number
          separacao_id?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "separacao_itens_separacao_id_fkey"
            columns: ["separacao_id"]
            isOneToOne: false
            referencedRelation: "separacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      separacoes: {
        Row: {
          cliente_codigo: number
          cliente_nome: string
          created_at: string
          id: string
          quantidade_itens: number
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_codigo: number
          cliente_nome: string
          created_at?: string
          id?: string
          quantidade_itens?: number
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Update: {
          cliente_codigo?: number
          cliente_nome?: string
          created_at?: string
          id?: string
          quantidade_itens?: number
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string
          detailed_description: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          sub_services: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description: string
          detailed_description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          sub_services?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string
          detailed_description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          sub_services?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          platform: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: []
      }
      social_media: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          platform: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          platform: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      store_credentials_temp: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password: string
          processed: boolean | null
          store_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password: string
          processed?: boolean | null
          store_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password?: string
          processed?: boolean | null
          store_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_credentials_temp_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_invoices: {
        Row: {
          amount: number
          barcode: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          payment_date: string | null
          pdf_url: string | null
          status: string | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          barcode?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          payment_date?: string | null
          pdf_url?: string | null
          status?: string | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          barcode?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          payment_date?: string | null
          pdf_url?: string | null
          status?: string | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_invoices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_notice_reads: {
        Row: {
          id: string
          notice_id: string
          read_at: string | null
          store_id: string
        }
        Insert: {
          id?: string
          notice_id: string
          read_at?: string | null
          store_id: string
        }
        Update: {
          id?: string
          notice_id?: string
          read_at?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_notice_reads_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "admin_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_notice_reads_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_social_posts: {
        Row: {
          comments: number | null
          content: string | null
          created_at: string | null
          engagement: number | null
          id: string
          image_url: string | null
          likes: number | null
          platform: string
          post_id: string
          post_url: string | null
          posted_at: string
          reach: number | null
          shares: number | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          comments?: number | null
          content?: string | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          image_url?: string | null
          likes?: number | null
          platform: string
          post_id: string
          post_url?: string | null
          posted_at: string
          reach?: number | null
          shares?: number | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          comments?: number | null
          content?: string | null
          created_at?: string | null
          engagement?: number | null
          id?: string
          image_url?: string | null
          likes?: number | null
          platform?: string
          post_id?: string
          post_url?: string | null
          posted_at?: string
          reach?: number | null
          shares?: number | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_social_posts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          category_id: string | null
          category_ids: string[] | null
          created_at: string
          credentials_sent: boolean | null
          description: string | null
          email: string | null
          facebook: string | null
          gallery_id: string | null
          id: string
          image_url: string | null
          instagram: string | null
          internal_address: string | null
          name: string
          phone: string | null
          product_images: string[] | null
          store_code: string | null
          subcategory_ids: string[] | null
          updated_at: string
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          category_id?: string | null
          category_ids?: string[] | null
          created_at?: string
          credentials_sent?: boolean | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          gallery_id?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          internal_address?: string | null
          name: string
          phone?: string | null
          product_images?: string[] | null
          store_code?: string | null
          subcategory_ids?: string[] | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          category_id?: string | null
          category_ids?: string[] | null
          created_at?: string
          credentials_sent?: boolean | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          gallery_id?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          internal_address?: string | null
          name?: string
          phone?: string | null
          product_images?: string[] | null
          store_code?: string | null
          subcategory_ids?: string[] | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_themes: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
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
      subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_pages: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          path: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          path: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          path?: string
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
      themes: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      Token_Whats: {
        Row: {
          cliente: string | null
          contador: number | null
          id: string
          "limite por dia": number | null
          NomedoChip: string | null
          Status: string | null
          Telefone: number | null
          Ultima_utilizacao: string | null
        }
        Insert: {
          cliente?: string | null
          contador?: number | null
          id: string
          "limite por dia"?: number | null
          NomedoChip?: string | null
          Status?: string | null
          Telefone?: number | null
          Ultima_utilizacao?: string | null
        }
        Update: {
          cliente?: string | null
          contador?: number | null
          id?: string
          "limite por dia"?: number | null
          NomedoChip?: string | null
          Status?: string | null
          Telefone?: number | null
          Ultima_utilizacao?: string | null
        }
        Relationships: []
      }
      transacoes_bancarias_importadas: {
        Row: {
          arquivo_origem: string | null
          conciliado: boolean
          conta_bancaria: string | null
          conta_pagar_id: string | null
          created_at: string | null
          data_lancamento: string
          descricao: string
          documento: string | null
          id: string
          tipo: string
          valor: number
        }
        Insert: {
          arquivo_origem?: string | null
          conciliado?: boolean
          conta_bancaria?: string | null
          conta_pagar_id?: string | null
          created_at?: string | null
          data_lancamento: string
          descricao: string
          documento?: string | null
          id?: string
          tipo: string
          valor: number
        }
        Update: {
          arquivo_origem?: string | null
          conciliado?: boolean
          conta_bancaria?: string | null
          conta_pagar_id?: string | null
          created_at?: string | null
          data_lancamento?: string
          descricao?: string
          documento?: string | null
          id?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_bancarias_importadas_conta_pagar_id_fkey"
            columns: ["conta_pagar_id"]
            isOneToOne: false
            referencedRelation: "contas_a_pagar"
            referencedColumns: ["id"]
          },
        ]
      }
      user_client_access: {
        Row: {
          client_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_client_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_group_members: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          created_at: string | null
          description: string | null
          group_id: string | null
          id: string
          is_active: boolean | null
          name: string
          redirect_after_login: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          redirect_after_login?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          redirect_after_login?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_representantes: {
        Row: {
          codigo_representante: number
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          codigo_representante: number
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          codigo_representante?: number
          created_at?: string | null
          id?: string
          user_id?: string
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
      whatsapp_grupo_acessos: {
        Row: {
          created_at: string
          grupo_id: string
          id: string
          link_unico_id: string
          redirected_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          grupo_id: string
          id?: string
          link_unico_id: string
          redirected_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          grupo_id?: string
          id?: string
          link_unico_id?: string
          redirected_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_grupo_acessos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_grupo_acessos_link_unico_id_fkey"
            columns: ["link_unico_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_links_unicos"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_grupos: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          invite_code: string
          link_completo: string
          link_unico_id: string
          nome_grupo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          invite_code: string
          link_completo: string
          link_unico_id: string
          nome_grupo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          invite_code?: string
          link_completo?: string
          link_unico_id?: string
          nome_grupo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_grupos_link_unico_id_fkey"
            columns: ["link_unico_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_links_unicos"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_links_unicos: {
        Row: {
          ativo: boolean
          codigo_unico: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo_unico: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo_unico?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      agendamentos_filtrados: {
        Row: {
          agendamento: string | null
          colaborador_nome: string | null
          data: string | null
          linha_editorial: string | null
          servico: string | null
          status: string | null
        }
        Relationships: []
      }
      bluebay_grupo_item_view: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          empresa_id: string | null
          empresa_nome: string | null
          gru_codigo: string | null
          gru_descricao: string | null
          id: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      bluebay_view_faturamento_resumo: {
        Row: {
          ITEM_CODIGO: string | null
          media_valor_unitario: number | null
          total_quantidade: number | null
        }
        Relationships: []
      }
      mv_faturamento_resumido: {
        Row: {
          CENTROCUSTO: string | null
          DATA_EMISSAO: string | null
          DATA_PEDIDO: string | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          REPRESENTANTE: number | null
        }
        Relationships: []
      }
      mv_titulos_centro_custo_bk: {
        Row: {
          ANOBASE: number | null
          DTEMISSAO: string | null
          DTPAGTO: string | null
          DTVENCIMENTO: string | null
          DTVENCTO: string | null
          FILIAL: number | null
          MATRIZ: number | null
          NUMDOCUMENTO: string | null
          NUMLCTO: number | null
          NUMNOTA: number | null
          PES_CODIGO: string | null
          STATUS: string | null
          TIPO: string | null
          VLRABATIMENTO: number | null
          VLRDESCONTO: number | null
          VLRSALDO: number | null
          VLRTITULO: number | null
        }
        Relationships: []
      }
      oni_agencia_capturas_view: {
        Row: {
          capture_date: string | null
          capture_end_date: string | null
          client_id: string | null
          client_logo_url: string | null
          client_name: string | null
          collaborator_id: string | null
          collaborator_name: string | null
          collaborator_photo_url: string | null
          created_at: string | null
          creators: string[] | null
          description: string | null
          editorial_line_color: string | null
          editorial_line_id: string | null
          editorial_line_name: string | null
          id: string | null
          is_all_day: boolean | null
          location: string | null
          product_id: string | null
          service_color: string | null
          service_id: string | null
          service_name: string | null
          status_color: string | null
          status_id: string | null
          status_name: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_capturas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_capturas_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_content_schedules_view: {
        Row: {
          caption: string | null
          capture_date: string | null
          capture_end_date: string | null
          channel: string[] | null
          client_id: string | null
          client_logo_url: string | null
          client_name: string | null
          collaborator_email: string | null
          collaborator_id: string | null
          collaborator_name: string | null
          created_at: string | null
          creators: string[] | null
          description: string | null
          editorial_line_color: string | null
          editorial_line_id: string | null
          editorial_line_name: string | null
          editorial_line_symbol: string | null
          execution_phase: string | null
          facebook_location_id: string | null
          facebook_post_id: string | null
          facebook_post_url: string | null
          facebook_reels_cover_path: string | null
          facebook_status: string | null
          facebook_user_tags: Json | null
          google_drive_file_id: string | null
          google_drive_file_path: string | null
          google_drive_thumbnail_url: string | null
          google_drive_webview_link: string | null
          id: string | null
          instagram_location_id: string | null
          instagram_post_id: string | null
          instagram_post_url: string | null
          instagram_reels_cover_path: string | null
          instagram_status: string | null
          instagram_story_mentions: Json | null
          instagram_user_tags: Json | null
          is_all_day: boolean | null
          location: string | null
          meta_error_message: string | null
          meta_media_url: string | null
          meta_post_id: string | null
          meta_post_status: string | null
          post_format: string | null
          product_color: string | null
          product_id: string | null
          product_name: string | null
          product_symbol: string | null
          scheduled_date: string | null
          service_category: string | null
          service_color: string | null
          service_id: string | null
          service_name: string | null
          status_color: string | null
          status_id: string | null
          status_name: string | null
          tiktok_caption: string | null
          tiktok_error_message: string | null
          tiktok_post_id: string | null
          tiktok_post_url: string | null
          tiktok_status: string | null
          tiktok_video_path: string | null
          title: string | null
          updated_at: string | null
          youtube_error_message: string | null
          youtube_post_id: string | null
          youtube_post_status: string | null
          youtube_privacy_status: string | null
          youtube_video_title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_content_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_schedules_with_captures: {
        Row: {
          caption: string | null
          capture_date: string | null
          capture_description: string | null
          capture_end_date: string | null
          capture_id: string | null
          channel: string[] | null
          client_id: string | null
          collaborator_id: string | null
          created_at: string | null
          creators: string[] | null
          description: string | null
          editorial_line_id: string | null
          execution_phase: string | null
          facebook_post_id: string | null
          facebook_post_url: string | null
          facebook_status: string | null
          google_drive_file_id: string | null
          google_drive_file_path: string | null
          google_drive_thumbnail_url: string | null
          google_drive_webview_link: string | null
          id: string | null
          instagram_post_id: string | null
          instagram_post_url: string | null
          instagram_status: string | null
          is_all_day: boolean | null
          location: string | null
          meta_error_message: string | null
          meta_media_url: string | null
          meta_post_id: string | null
          meta_post_status: string | null
          post_format: string | null
          product_id: string | null
          scheduled_date: string | null
          service_id: string | null
          status_id: string | null
          tiktok_post_id: string | null
          tiktok_post_url: string | null
          tiktok_status: string | null
          tiktok_video_path: string | null
          title: string | null
          updated_at: string | null
          youtube_post_id: string | null
          youtube_post_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_content_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups_with_profiles: {
        Row: {
          group_id: string | null
          id: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_requests_view: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          id: string | null
          protocol: string | null
          response: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string | null
          protocol?: string | null
          response?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string | null
          protocol?: string | null
          response?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vw_representantes: {
        Row: {
          codigo_representante: number | null
          nome_representante: string | null
        }
        Relationships: []
      }
      VW_RESUMO_GERAL: {
        Row: {
          CENTROCUSTO: string | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          REPRESENTANTE: number | null
        }
        Relationships: []
      }
      vw_titulos_vencidos_cliente: {
        Row: {
          PES_CODIGO: string | null
          quantidade_titulos: number | null
          total_vencido: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_client_access: {
        Args: { p_client_id: string; p_user_id: string }
        Returns: undefined
      }
      add_user_request: {
        Args: {
          attachment_url?: string
          department: string
          description: string
          protocol: string
          status: string
          title: string
          user_email: string
          user_id: string
        }
        Returns: {
          attachment_url: string | null
          created_at: string
          department: string
          description: string
          id: string
          protocol: string
          response: string | null
          status: string
          title: string
          updated_at: string
          user_email: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "bk_requests"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      add_user_to_group: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: undefined
      }
      calcular_valor_faturar_com_estoque: {
        Args: never
        Returns: {
          valor_total_faturavel: number
        }[]
      }
      calcular_valor_faturar_com_estoque_por_centrocusto: {
        Args: { centro_custo: string }
        Returns: {
          valor_total_faturavel: number
        }[]
      }
      calcular_valor_total_jab: {
        Args: never
        Returns: {
          valor_total_saldo: number
        }[]
      }
      calcular_valor_total_por_centrocusto: {
        Args: { centro_custo: string }
        Returns: {
          valor_total_saldo: number
        }[]
      }
      calcular_valor_vencido: {
        Args: { cliente_codigo: string }
        Returns: {
          total_vlr_saldo: number
        }[]
      }
      check_admin_access: { Args: { p_user_id: string }; Returns: boolean }
      check_admin_permission: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      check_is_admin: { Args: { user_id: string }; Returns: boolean }
      check_patrimonio_empresa_access: {
        Args: { empresa_uuid: string }
        Returns: boolean
      }
      check_user_in_group: {
        Args: { group_name: string; user_id: string }
        Returns: boolean
      }
      check_user_permission: {
        Args: {
          required_permission: Database["public"]["Enums"]["permission_type"]
          resource_path: string
          user_id: string
        }
        Returns: boolean
      }
      check_user_permission_for_groups: {
        Args: { user_id: string }
        Returns: boolean
      }
      create_news_event: {
        Args: {
          p_cover_image_url: string
          p_end_date: string
          p_full_description: string
          p_is_active: boolean
          p_is_featured: boolean
          p_location: string
          p_publication_end_date: string
          p_publication_start_date: string
          p_short_description: string
          p_start_date: string
          p_title: string
        }
        Returns: undefined
      }
      delete_news_event: { Args: { p_id: string }; Returns: undefined }
      delete_site_feirinha_banner: { Args: { p_id: string }; Returns: boolean }
      delete_testimonial: { Args: { p_id: string }; Returns: undefined }
      exec_sql: { Args: { query: string }; Returns: Json }
      fetch_site_feirinha_banners: {
        Args: { p_active_only?: boolean; p_current_date?: string }
        Returns: Json
      }
      generate_random_password: { Args: never; Returns: string }
      generate_store_email: { Args: never; Returns: string }
      generate_store_username: {
        Args: { store_id: string; store_name: string }
        Returns: string
      }
      get_active_news_events: {
        Args: { p_current_date: string }
        Returns: {
          cover_image_url: string
          created_at: string
          end_date: string
          full_description: string
          id: string
          is_active: boolean
          is_featured: boolean
          location: string
          publication_end_date: string
          publication_start_date: string
          short_description: string
          start_date: string
          title: string
          updated_at: string
        }[]
      }
      get_active_testimonials: {
        Args: never
        Returns: {
          avatar_url: string
          company: string
          content: string
          display_order: number
          id: string
          job_position: string
          name: string
        }[]
      }
      get_all_articles: {
        Args: never
        Returns: {
          author: string
          category: string
          content: string
          excerpt: string
          id: string
          image_url: string
          is_featured: boolean
          is_published: boolean
          read_time: string
          slug: string
          title: string
        }[]
      }
      get_all_groups: {
        Args: never
        Returns: {
          created_at: string | null
          description: string | null
          homepage: string | null
          id: string
          name: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "groups"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_all_testimonials: {
        Args: never
        Returns: {
          avatar_url: string
          company: string
          content: string
          display_order: number
          id: string
          is_active: boolean
          job_position: string
          name: string
        }[]
      }
      get_banner_by_id: {
        Args: { p_id: string }
        Returns: {
          created_at: string
          description: string
          end_date: string
          id: string
          image_url: string
          is_active: boolean
          mobile_image_url: string
          name: string
          page_location: string
          start_date: string
          title: string
          updated_at: string
        }[]
      }
      get_bk_faturamento: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "BLUEBAY_FATURAMENTO"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_bluebay_faturamento: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "BLUEBAY_FATURAMENTO"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_client_consolidated_billing: {
        Args: { p_client_id?: string; p_month?: number; p_year?: number }
        Returns: {
          client_id: string
          client_name: string
          general_discount: number
          net_amount: number
          observation: string
          total_amount: number
        }[]
      }
      get_client_performance_report: {
        Args: { p_months_back?: number }
        Returns: {
          client_id: string
          client_name: string
          general_discount: number
          month: number
          net_amount: number
          total_amount: number
          year: number
        }[]
      }
      get_contact_leads: {
        Args: never
        Returns: {
          cargo: string
          created_at: string
          email: string
          empresa: string
          id: string
          mensagem: string
          nome: string
        }[]
      }
      get_estoque_para_itens: {
        Args: { item_codigos: string[] }
        Returns: {
          fisico: number
          item_codigo: string
        }[]
      }
      get_filtered_schedules_by_collaborator: {
        Args: { collab_id: string }
        Returns: {
          agendamento: string
          colaborador_nome: string
          data: string
          linha_editorial: string
          servico: string
          status: string
        }[]
      }
      get_home_leads: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
        }[]
      }
      get_itens_por_cliente: {
        Args: {
          cliente_codigo: number
          data_final: string
          data_inicial: string
        }
        Returns: {
          descricao: string
          item_codigo: string
          pedido: string
          qtde_entregue: number
          qtde_pedida: number
          qtde_saldo: number
          representante: number
          valor_unitario: number
        }[]
      }
      get_news_event_by_id: {
        Args: { p_id: string }
        Returns: {
          cover_image_url: string
          created_at: string
          end_date: string
          full_description: string
          id: string
          is_active: boolean
          is_featured: boolean
          location: string
          publication_end_date: string
          publication_start_date: string
          short_description: string
          start_date: string
          title: string
          updated_at: string
        }[]
      }
      get_news_events: {
        Args: never
        Returns: {
          cover_image_url: string
          created_at: string
          end_date: string
          full_description: string
          id: string
          is_active: boolean
          is_featured: boolean
          location: string
          publication_end_date: string
          publication_start_date: string
          short_description: string
          start_date: string
          title: string
          updated_at: string
        }[]
      }
      get_next_rps_number: { Args: never; Returns: number }
      get_paginated_schedules: {
        Args: {
          p_client_id: string
          p_collaborator_id?: string
          p_custom_end_date?: string
          p_custom_start_date?: string
          p_include_stories?: boolean
          p_limit?: number
          p_month: number
          p_offset?: number
          p_year: number
        }
        Returns: {
          caption: string
          channel: string[]
          client_id: string
          client_name: string
          collaborator_email: string
          collaborator_id: string
          collaborator_name: string
          collaborator_photo_url: string
          created_at: string
          creators: string[]
          description: string
          editorial_line_color: string
          editorial_line_id: string
          editorial_line_name: string
          editorial_line_symbol: string
          execution_phase: string
          facebook_location_id: string
          facebook_post_id: string
          facebook_post_url: string
          facebook_reels_cover_path: string
          facebook_status: string
          facebook_user_tags: Json
          google_drive_file_id: string
          google_drive_file_path: string
          google_drive_thumbnail_url: string
          google_drive_webview_link: string
          id: string
          instagram_location_id: string
          instagram_post_id: string
          instagram_post_url: string
          instagram_reels_cover_path: string
          instagram_status: string
          instagram_story_mentions: Json
          instagram_user_tags: Json
          location: string
          meta_error_message: string
          meta_media_url: string
          meta_post_id: string
          meta_post_status: string
          post_format: string
          product_color: string
          product_id: string
          product_name: string
          product_symbol: string
          scheduled_date: string
          service_category: string
          service_color: string
          service_id: string
          service_name: string
          status_color: string
          status_id: string
          status_name: string
          tiktok_caption: string
          tiktok_error_message: string
          tiktok_post_id: string
          tiktok_post_url: string
          tiktok_status: string
          tiktok_video_path: string
          title: string
          updated_at: string
          youtube_post_id: string
          youtube_post_status: string
          youtube_privacy_status: string
          youtube_video_title: string
        }[]
      }
      get_pedidos_agrupados: {
        Args: { data_final: string; data_inicial: string }
        Returns: {
          pes_codigo: number
          quantidade_itens_com_saldo: number
          quantidade_pedidos: number
          valor_do_saldo: number
        }[]
      }
      get_pedidos_por_cliente: {
        Args: { data_final: string; data_inicial: string }
        Returns: {
          cliente_nome: string
          pes_codigo: number
          representante_codigo: number
          representante_nome: string
          total_pedidos_distintos: number
          total_quantidade_saldo: number
          total_valor_faturado: number
          total_valor_pedido: number
          total_valor_saldo: number
          volume_saudavel_faturamento: number
        }[]
      }
      get_pedidos_unicos: {
        Args: {
          data_final: string
          data_inicial: string
          limit_val: number
          offset_val: number
        }
        Returns: {
          ped_numpedido: string
          total_count: number
        }[]
      }
      get_pedidos_unicos_by_centrocusto: {
        Args: {
          centrocusto: string
          data_final: string
          data_inicial: string
          limit_val: number
          offset_val: number
        }
        Returns: {
          ped_numpedido: string
          total_count: number
        }[]
      }
      get_stock_sales_analytics:
        | {
            Args: {
              p_end_date: string
              p_new_product_date: string
              p_start_date: string
            }
            Returns: {
              data_ultima_venda: string
              datacadastro: string
              descricao: string
              dias_cobertura: number
              disponivel: number
              entrou: number
              fisico: number
              giro_estoque: number
              gru_descricao: string
              item_codigo: string
              limite: number
              percentual_estoque_vendido: number
              produto_novo: boolean
              qtd_vendida: number
              ranking: number
              reservado: number
              valor_total_vendido: number
            }[]
          }
        | {
            Args: {
              p_end_date: string
              p_limit?: number
              p_new_product_date: string
              p_offset?: number
              p_start_date: string
            }
            Returns: {
              data_ultima_venda: string
              datacadastro: string
              descricao: string
              dias_cobertura: number
              disponivel: number
              entrou: number
              fisico: number
              giro_estoque: number
              gru_descricao: string
              item_codigo: string
              limite: number
              percentual_estoque_vendido: number
              produto_novo: boolean
              qtd_vendida: number
              ranking: number
              reservado: number
              valor_total_vendido: number
            }[]
          }
      get_user_clients: {
        Args: { p_user_id: string }
        Returns: {
          client_id: string
          client_name: string
        }[]
      }
      get_user_group_homepage: {
        Args: { user_id_param: string }
        Returns: string
      }
      get_user_patrimonio_empresas: { Args: never; Returns: string[] }
      get_user_redirect_after_login: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_app_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_client_access: { Args: { client_uuid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_site_feirinha_banner:
        | {
            Args: {
              p_description?: string
              p_end_date: string
              p_image_url: string
              p_is_active?: boolean
              p_mobile_image_url?: string
              p_name: string
              p_page_location?: string
              p_start_date: string
              p_title?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_description?: string
              p_end_date: string
              p_image_url: string
              p_is_active?: boolean
              p_name: string
              p_page_location?: string
              p_start_date: string
              p_title?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_description?: string
              p_end_date: string
              p_image_url: string
              p_is_active?: boolean
              p_page_location?: string
              p_start_date: string
              p_title: string
            }
            Returns: Json
          }
      insert_testimonial: {
        Args: {
          p_avatar_url: string
          p_company: string
          p_content: string
          p_display_order: number
          p_is_active: boolean
          p_name: string
          p_position: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_patrimonio_admin: { Args: never; Returns: boolean }
      is_store_admin: { Args: never; Returns: boolean }
      is_store_owner: { Args: { store_user_id: string }; Returns: boolean }
      is_temp_admin: { Args: never; Returns: boolean }
      is_user_admin: { Args: { user_id: string }; Returns: boolean }
      refresh_mv_titulos_centro_custo_bk: { Args: never; Returns: undefined }
      remove_user_client_access: {
        Args: { p_client_id: string; p_user_id: string }
        Returns: undefined
      }
      remove_user_from_group: {
        Args: { p_assignment_id: string }
        Returns: undefined
      }
      update_news_event: {
        Args: {
          p_cover_image_url: string
          p_end_date: string
          p_full_description: string
          p_id: string
          p_is_active: boolean
          p_is_featured: boolean
          p_location: string
          p_publication_end_date: string
          p_publication_start_date: string
          p_short_description: string
          p_start_date: string
          p_title: string
        }
        Returns: undefined
      }
      update_site_feirinha_banner: {
        Args: {
          p_description?: string
          p_end_date: string
          p_id: string
          p_image_url: string
          p_is_active?: boolean
          p_mobile_image_url?: string
          p_name: string
          p_page_location?: string
          p_start_date: string
          p_title?: string
        }
        Returns: Json
      }
      update_testimonial: {
        Args: {
          p_avatar_url: string
          p_company: string
          p_content: string
          p_display_order: number
          p_id: string
          p_is_active: boolean
          p_name: string
          p_position: string
        }
        Returns: undefined
      }
      upsert_instagram_media: {
        Args: {
          p_caption: string
          p_id: string
          p_is_comment_enabled: boolean
          p_media_product_type: string
          p_media_type: string
          p_media_url: string
          p_owner_id: string
          p_permalink: string
          p_posted_at: string
          p_raw: Json
          p_thumbnail_url: string
        }
        Returns: undefined
      }
      user_belongs_to_group: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      user_can_access_page: {
        Args: { _page_path: string; _user_id: string }
        Returns: boolean
      }
      user_has_client_access: {
        Args: { client_id: string; user_id: string }
        Returns: boolean
      }
      verificar_aprovacao_conta: {
        Args: { conta_id: string }
        Returns: boolean
      }
      verify_user_session: { Args: never; Returns: boolean }
    }
    Enums: {
      acao_auditoria:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "APPROVE"
        | "PAY"
        | "CANCEL"
        | "IMPORT"
      app_role: "admin" | "editor" | "viewer" | "user"
      certificado_tipo_enum: "A1" | "A3"
      metodo_pagamento:
        | "ted"
        | "pix"
        | "boleto"
        | "transferencia"
        | "dinheiro"
        | "cartao"
      permission_type: "read" | "write" | "admin"
      ponto_role:
        | "ponto_admin"
        | "ponto_gestor"
        | "ponto_colaborador"
        | "ponto_visualizador"
      reembolso_fatura_status: "emitido" | "pago" | "cancelado"
      reembolso_lote_status: "fechado" | "faturado" | "ignorado" | "cancelado"
      status_ajuste: "pendente" | "aprovado" | "rejeitado" | "cancelado"
      status_aprovacao: "aprovado" | "rejeitado" | "pendente"
      status_conta:
        | "pendente"
        | "aprovada"
        | "agendada"
        | "paga"
        | "vencida"
        | "cancelada"
      status_fechamento: "aberto" | "em_processamento" | "fechado" | "reaberto"
      status_registro_ponto:
        | "valido"
        | "pendente_ajuste"
        | "ajustado"
        | "invalido"
      tipo_ajuste_ponto: "inclusao" | "exclusao" | "alteracao" | "abono"
      tipo_ausencia:
        | "falta"
        | "atestado"
        | "ferias"
        | "folga"
        | "licenca"
        | "afastamento"
      tipo_jornada: "padrao" | "flexivel" | "turno" | "escala"
      tipo_pessoa: "fisica" | "juridica"
      tipo_registro_ponto:
        | "entrada"
        | "saida_almoco"
        | "retorno_almoco"
        | "saida"
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
      acao_auditoria: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "APPROVE",
        "PAY",
        "CANCEL",
        "IMPORT",
      ],
      app_role: ["admin", "editor", "viewer", "user"],
      certificado_tipo_enum: ["A1", "A3"],
      metodo_pagamento: [
        "ted",
        "pix",
        "boleto",
        "transferencia",
        "dinheiro",
        "cartao",
      ],
      permission_type: ["read", "write", "admin"],
      ponto_role: [
        "ponto_admin",
        "ponto_gestor",
        "ponto_colaborador",
        "ponto_visualizador",
      ],
      reembolso_fatura_status: ["emitido", "pago", "cancelado"],
      reembolso_lote_status: ["fechado", "faturado", "ignorado", "cancelado"],
      status_ajuste: ["pendente", "aprovado", "rejeitado", "cancelado"],
      status_aprovacao: ["aprovado", "rejeitado", "pendente"],
      status_conta: [
        "pendente",
        "aprovada",
        "agendada",
        "paga",
        "vencida",
        "cancelada",
      ],
      status_fechamento: ["aberto", "em_processamento", "fechado", "reaberto"],
      status_registro_ponto: [
        "valido",
        "pendente_ajuste",
        "ajustado",
        "invalido",
      ],
      tipo_ajuste_ponto: ["inclusao", "exclusao", "alteracao", "abono"],
      tipo_ausencia: [
        "falta",
        "atestado",
        "ferias",
        "folga",
        "licenca",
        "afastamento",
      ],
      tipo_jornada: ["padrao", "flexivel", "turno", "escala"],
      tipo_pessoa: ["fisica", "juridica"],
      tipo_registro_ponto: [
        "entrada",
        "saida_almoco",
        "retorno_almoco",
        "saida",
      ],
    },
  },
} as const
