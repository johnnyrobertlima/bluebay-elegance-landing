
import { useState, memo, useEffect } from "react";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { ItemGroupManagementHeader } from "@/components/bluebay_adm/item-group-management/ItemGroupManagementHeader";
import { ItemGroupTable } from "@/components/bluebay_adm/item-group-management/ItemGroupTable";
import { ItemGroupDialog } from "@/components/bluebay_adm/item-group-management/ItemGroupDialog";
import { ItemGroupImportDialog } from "@/components/bluebay_adm/item-group-management/ItemGroupImportDialog";
import { useItemGroupManagement } from "@/hooks/bluebay_adm/useItemGroupManagement";
import { Dialog } from "@/components/ui/dialog";

// Memoized components to avoid unnecessary re-renders
const MemoizedItemGroupManagementHeader = memo(ItemGroupManagementHeader);
const MemoizedItemGroupTable = memo(ItemGroupTable);
const MemoizedItemGroupDialog = memo(ItemGroupDialog);
const MemoizedItemGroupImportDialog = memo(ItemGroupImportDialog);

const BluebayAdmItemGrupoManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { 
    groups, 
    isLoading, 
    selectedGroup, 
    setSelectedGroup, 
    handleSaveGroup,
    handleExportGroups,
    handleImportGroups,
    empresas,
    refreshData 
  } = useItemGroupManagement();

  // Debug to check if groups are available
  useEffect(() => {
    console.log(`Component received ${groups.length} groups`);
  }, [groups]);

  const handleNewGroup = () => {
    setSelectedGroup(null);
    setIsDialogOpen(true);
  };

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
  };

  const onSaveGroup = async (groupData: any) => {
    const success = await handleSaveGroup(groupData);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  const handleImport = async (data: any[]) => {
    await handleImportGroups(data);
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <MemoizedItemGroupManagementHeader 
            onNewGroup={handleNewGroup}
            onRefresh={refreshData}
            onExport={handleExportGroups}
            onImport={handleOpenImportDialog}
          />

          <MemoizedItemGroupTable
            groups={groups}
            isLoading={isLoading}
            onEdit={handleEditGroup}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <MemoizedItemGroupDialog
            selectedGroup={selectedGroup}
            onSave={onSaveGroup}
            empresas={empresas}
            isOpen={isDialogOpen}
          />
        </Dialog>

        <MemoizedItemGroupImportDialog
          isOpen={isImportDialogOpen}
          onClose={handleCloseImportDialog}
          onImport={handleImport}
        />
      </div>
    </main>
  );
};

export default BluebayAdmItemGrupoManagement;
