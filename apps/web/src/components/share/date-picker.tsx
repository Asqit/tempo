"use client";
import * as React from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value: Date;
  setValue(d: Date): void;
  withTime?: boolean;
  label?: string;
  id?: string;
}

function mergeDateAndTime(date: Date, time: string): Date {
  const [h, m, s] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(h ?? 0, m ?? 0, s ?? 0, 0);
  return next;
}

export function DatePicker({
  value,
  setValue,
  withTime = false,
  label = "Vyber datum",
  id,
}: Props) {
  const generatedId = React.useId();
  const inputId = id ?? `date-picker-${generatedId.replaceAll(":", "")}`;
  const timeInputId = `${inputId}-time`;
  const [date, setDate] = React.useState<Date>(value ?? new Date());
  const [time, setTime] = React.useState<string>(
    format(value ?? new Date(), "HH:mm:ss"),
  );

  const handleSelectDate = (d?: Date) => {
    if (!d) return;
    setDate(d);
    setValue(withTime ? mergeDateAndTime(d, time) : d);
  };

  const handleTimeChange = (t: string) => {
    setTime(t);
    setValue(mergeDateAndTime(date, t));
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            id={id}
            data-empty={!date}
            className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
          />
        }
      >
        <CalendarIcon />
        {date ? (
          format(date, withTime ? "d. M. yyyy HH:mm" : "PPP")
        ) : (
          <span>{label}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          locale={cs}
          selected={date}
          onSelect={handleSelectDate}
        />
        {withTime && (
          <div className="border-t bg-card p-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={timeInputId}>Čas</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={timeInputId}
                    type="time"
                    step="1"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <InputGroupAddon>
                    <Clock2Icon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
