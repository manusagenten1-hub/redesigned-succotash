import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { CalendarEvent } from '../context/AppContext';

export default function DashboardCalendar() {
  const { agendaEvents } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const { days, eventsByDay } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const emptyDaysBefore = firstDayOfWeek;

    const daysInMonth = lastDayOfMonth.getDate();
    const totalGrids = Math.ceil((emptyDaysBefore + daysInMonth) / 7) * 7;

    const days = [];
    for (let i = 0; i < totalGrids; i++) {
      if (i < emptyDaysBefore || i >= emptyDaysBefore + daysInMonth) {
        days.push(null); // Empty slot
      } else {
        const day = i - emptyDaysBefore + 1;
        days.push(new Date(year, month, day));
      }
    }

    const eventsMap: Record<string, CalendarEvent[]> = {};
    agendaEvents.forEach(event => {
      if (event.status === 'Concluído') return;
      const d = new Date(event.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!eventsMap[dateStr]) {
        eventsMap[dateStr] = [];
      }
      eventsMap[dateStr].push(event);
    });

    return { days, eventsByDay: eventsMap };
  }, [currentDate, agendaEvents]);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getEventDotColor = (type: CalendarEvent['type']) => {
    switch(type) {
      case 'Reunião': return 'bg-red-500';
      case 'Follow-up': return 'bg-yellow-400';
      case 'Tarefa interna': return 'bg-purple-400';
      default: return 'bg-gray-400';
    }
  };

  const today = new Date();
  const isToday = (d: Date | null) => {
    if (!d) return false;
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return agendaEvents
      .filter(e => new Date(e.date) >= now && e.status !== 'Concluído')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [agendaEvents]);

  return (
    <div className="bg-[#210606] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          <CalendarIcon size={20} className="text-[#F31333]" />
          Calendário de Agendamentos
        </h2>
        <div className="flex items-center gap-4">
          <span className="font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div className="flex gap-1 bg-[rgba(0,0,0,0.2)] rounded-lg p-1 border border-white/10">
            <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-md text-gray-300 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/10 rounded-t-xl overflow-hidden mb-px">
        {weekDays.map(day => (
          <div key={day} className="bg-[rgba(0,0,0,0.2)] text-center text-xs font-bold text-gray-300 py-3 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-b-xl overflow-hidden mb-6">
        {days.map((date, index) => {
          const dateStr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
          const dayEvents = dateStr ? (eventsByDay[dateStr] || []) : [];
          
          return (
            <div 
              key={index} 
              className={cn(
                "min-h-[50px] p-1 transition-colors relative flex flex-col items-center",
                date ? "bg-[rgba(0,0,0,0.2)]" : "bg-[rgba(0,0,0,0.5)]",
                isToday(date) && "bg-[#1c2c3d]"
              )}
            >
              {date && (
                <>
                  <div className="flex justify-center mb-1">
                    <span className={cn(
                      "text-xs w-6 h-6 flex items-center justify-center rounded-full",
                      isToday(date) ? "bg-tecnova-neon text-[#0a0a0a] font-bold shadow-[0_0_10px_rgba(243,19,51,0.4)]" : "text-gray-300"
                    )}>
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center max-w-full">
                    {dayEvents.slice(0, 3).map(event => (
                      <div 
                        key={event.id}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          getEventDotColor(event.type)
                        )}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-gray-500" title={`+${dayEvents.length - 3}`} />
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Clock size={16} className="text-[#F31333]" />
          Próximos Agendamentos
        </h3>
        
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-300 bg-[rgba(0,0,0,0.2)] p-3 rounded-lg border border-white/10 text-center">Nenhum evento futuro encontrado.</p>
          ) : (
            upcomingEvents.map(event => (
               <div key={event.id} className="bg-[rgba(0,0,0,0.2)] border-l-2 border-r border-t border-b border-white/10 rounded-lg p-3 flex flex-col gap-1.5 transition-transform hover:-translate-y-0.5"
                    style={{ borderLeftColor: getEventDotColor(event.type).replace('bg-', '') }}>
                 <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2">
                     <div className={cn("w-2.5 h-2.5 rounded-full shadow-md", getEventDotColor(event.type))} />
                     <p className="text-sm font-bold text-white">{event.title}</p>
                   </div>
                 </div>
                 <div className="text-xs text-gray-300 pl-4.5 flex items-center justify-between">
                   <span className="font-medium text-gray-400">
                     {new Date(event.date).toLocaleDateString('pt-BR')} às {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 text-gray-300 px-2 py-1 rounded border border-white/5">{event.type}</span>
                 </div>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
