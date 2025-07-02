
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { bankAccounts as initialBankAccounts } from "@/lib/data"
import type { BankAccount } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"
import { ManageAccountDialog } from "@/components/manage-account-dialog"

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialBankAccounts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  const handleOpenDialog = (account: BankAccount | null = null) => {
    setEditingAccount(account)
    setIsDialogOpen(true)
  }

  const handleSaveAccount = (accountData: Omit<BankAccount, 'id'> | BankAccount) => {
    if ('id' in accountData && editingAccount) {
      // Edit
      const updatedAccount = { ...editingAccount, ...accountData };
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? updatedAccount : acc));
      const index = initialBankAccounts.findIndex(acc => acc.id === editingAccount.id);
      if (index !== -1) initialBankAccounts[index] = updatedAccount;
    } else {
      // Create
      const newAccount: BankAccount = {
        id: `acc-${Date.now()}`,
        ...(accountData as Omit<BankAccount, 'id'>)
      };
      setAccounts([...accounts, newAccount]);
      initialBankAccounts.push(newAccount);
    }
  }

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId));
    const index = initialBankAccounts.findIndex(acc => acc.id === accountId);
    if (index !== -1) initialBankAccounts.splice(index, 1);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ajustes</CardTitle>
          <CardDescription>Gestiona la configuración de tu cuenta y de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="theme-toggle" className="font-semibold">Apariencia</Label>
              <p className="text-sm text-muted-foreground">Selecciona el tema claro u oscuro para la aplicación.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cuentas Bancarias</CardTitle>
            <CardDescription>Gestiona las cuentas de la empresa para transferencias.</CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Cuenta
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">{account.bankName} - <span className="font-normal text-muted-foreground">{account.accountHolder}</span></h4>
                <p className="text-sm text-muted-foreground">N°: {account.accountNumber} | CCI: {account.cci}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(account)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAccount(account.id)}>
                  <Trash2 className="h-4 w-4" />
                   <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-muted-foreground text-center py-4">No hay cuentas bancarias registradas.</p>}
        </CardContent>
      </Card>

      <ManageAccountDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAccountSaved={handleSaveAccount}
        account={editingAccount}
      />
    </div>
  );
}
