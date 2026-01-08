import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ShieldCheck, ShieldX, Users, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const UserRolesManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    isAdmin,
    isCheckingAdmin,
    usersWithRoles,
    isLoadingUsers,
    addRole,
    removeRole,
    isAddingRole,
    isRemovingRole,
  } = useUserRoles();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isCheckingAdmin && isAdmin === false) {
      toast.error('Acesso negado. Você não tem permissão de administrador.');
      navigate('/');
    }
  }, [isAdmin, isCheckingAdmin, navigate]);

  const handleToggleRole = (userId: string, role: AppRole, hasRole: boolean) => {
    if (hasRole) {
      removeRole({ userId, role });
    } else {
      addRole({ userId, role });
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (authLoading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Gerenciamento de Roles
            </h1>
            <p className="text-muted-foreground">
              Gerencie as permissões dos usuários do sistema
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingUsers ? <Skeleton className="h-8 w-16" /> : usersWithRoles?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-destructive" />
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingUsers ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  usersWithRoles?.filter(u => u.roles.includes('admin')).length || 0
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldX className="h-4 w-4 text-muted-foreground" />
                Sem Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingUsers ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  usersWithRoles?.filter(u => u.roles.length === 0).length || 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Clique nos botões de role para adicionar ou remover permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Roles Atuais</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithRoles?.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {userItem.full_name || 'Sem nome'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {userItem.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {userItem.roles.length > 0 ? (
                            userItem.roles.map((role) => (
                              <Badge key={role} variant={getRoleBadgeVariant(role)}>
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">Sem roles</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={userItem.roles.includes('admin') ? 'destructive' : 'outline'}
                            onClick={() => handleToggleRole(userItem.id, 'admin', userItem.roles.includes('admin'))}
                            disabled={isAddingRole || isRemovingRole || userItem.id === user?.id}
                          >
                            {userItem.roles.includes('admin') ? (
                              <>
                                <ShieldX className="h-4 w-4 mr-1" />
                                Remover Admin
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Tornar Admin
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant={userItem.roles.includes('user') ? 'secondary' : 'outline'}
                            onClick={() => handleToggleRole(userItem.id, 'user', userItem.roles.includes('user'))}
                            disabled={isAddingRole || isRemovingRole}
                          >
                            {userItem.roles.includes('user') ? (
                              <>
                                <ShieldX className="h-4 w-4 mr-1" />
                                Remover User
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Adicionar User
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserRolesManagement;
