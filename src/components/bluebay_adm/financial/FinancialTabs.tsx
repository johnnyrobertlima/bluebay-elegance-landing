
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface FinancialTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: FinancialTab[];
}

export const FinancialTabs: React.FC<FinancialTabsProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-6 w-full max-w-5xl mb-4">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-0">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </TabsContent>
    </Tabs>
  );
};
