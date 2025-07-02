"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/data";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  if (!currentUser) {
    return <p>Cargando perfil...</p>
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person" />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-3xl">{currentUser.name}</CardTitle>
                <CardDescription>Esta es tu página de perfil. Aquí puedes ver tu información.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
            <h3 className="font-semibold">Correo Electrónico</h3>
            <p className="text-muted-foreground">{currentUser.email}</p>
        </div>
         <div>
            <h3 className="font-semibold">Rol</h3>
            <p className="text-muted-foreground">{currentUser.role}</p>
        </div>
      </CardContent>
    </Card>
  );
}
