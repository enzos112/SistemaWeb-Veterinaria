
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { calendarEvents as initialCalendarEvents } from "@/lib/data"
import { cn } from "@/lib/utils"
import { File, ShoppingCart, Stethoscope, PartyPopper, Pencil } from "lucide-react"
import { EditEventDialog } from "@/components/edit-event-dialog"
import type { CalendarEvent } from "@/lib/types"

const eventIcons = {
    pedido: <ShoppingCart className="h-4 w-4" />,
    cita: <Stethoscope className="h-4 w-4" />,
    evento: <PartyPopper className="h-4 w-4" />
}

const eventColors = {
    pedido: "bg-blue-100 text-blue-800",
    cita: "bg-green-100 text-green-800",
    evento: "bg-purple-100 text-purple-800",
}


export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents)
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)


    const selectedDayEvents = calendarEvents.filter(
        event => format(new Date(event.date), 'yyyy-MM-dd') === (date ? format(date, 'yyyy-MM-dd') : '')
    ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const handleExport = () => {
        const dataToExport = calendarEvents.map(event => ({
            Fecha: event.date,
            Titulo: event.title,
            Descripcion: event.description,
            Tipo: event.type
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Eventos");
        XLSX.writeFile(workbook, "ElAmigo_Calendario.xlsx");
    };

    const handleEventUpdated = (updatedEvent: CalendarEvent) => {
        setCalendarEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        const index = initialCalendarEvents.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
            initialCalendarEvents[index] = updatedEvent;
        }
        setEditingEvent(null);
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Calendario de Eventos</CardTitle>
                        <CardDescription>Selecciona una fecha para ver los eventos programados.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            locale={es}
                            modifiers={{
                                hasEvent: calendarEvents.map(e => new Date(e.date))
                            }}
                            modifiersStyles={{
                                hasEvent: {
                                    border: '2px solid hsl(var(--primary))',
                                    borderRadius: '9999px',
                                }
                            }}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>
                                    Eventos para {date ? format(date, "PPP", { locale: es }) : "hoy"}
                                </CardTitle>
                                <CardDescription>
                                    {selectedDayEvents.length} evento(s) encontrado(s).
                                </CardDescription>
                            </div>
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                                <File className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Exportar
                                </span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                        {selectedDayEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDayEvents.map(event => (
                                    <div key={event.id} className="flex items-start gap-4 group">
                                        <div className={cn("flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center", eventColors[event.type])}>
                                            {eventIcons[event.type]}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0"
                                            onClick={() => setEditingEvent(event)}
                                        >
                                            <Pencil className="h-4 w-4"/>
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                            <p>No hay eventos para esta fecha.</p> 
                            </div>
                        )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
             <EditEventDialog 
                event={editingEvent}
                open={!!editingEvent}
                onOpenChange={(open) => !open && setEditingEvent(null)}
                onEventUpdated={handleEventUpdated}
            />
        </>
    )
}
