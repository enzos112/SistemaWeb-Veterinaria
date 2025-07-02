
"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { BankAccount } from "@/lib/types"

interface ManageAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountSaved: (accountData: Omit<BankAccount, 'id'> | BankAccount) => void;
  account: BankAccount | null;
}

const accountFormSchema = z.object({
  bankName: z.string().min(2, "El nombre del banco es requerido."),
  accountHolder: z.string().min(3, "El titular es requerido."),
  accountNumber: z.string().min(5, "El número de cuenta es requerido."),
  cci: z.string().optional(),
})

export function ManageAccountDialog({ open, onOpenChange, onAccountSaved, account }: ManageAccountDialogProps) {
  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      cci: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(account || {
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        cci: "",
      });
    }
  }, [open, account, form]);

  function onSubmit(values: z.infer<typeof accountFormSchema>) {
    if (account) {
        onAccountSaved({ ...account, ...values });
    } else {
        onAccountSaved(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? "Editar" : "Añadir"} Cuenta Bancaria</DialogTitle>
          <DialogDescription>
            {account ? "Actualiza los datos de la cuenta." : "Añade una nueva cuenta para recibir transferencias."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Banco</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: BCP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Titular</FormLabel>
                  <FormControl>
                    <Input placeholder="El Amigo E.I.R.L." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Cuenta</FormLabel>
                  <FormControl>
                    <Input placeholder="123-4567890-1-23" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cci"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CCI (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="002123..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
