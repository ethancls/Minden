"use client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import React, { useId } from 'react';

export function DeleteConfirm({
  targetFormId,
  triggerClassName = 'text-sm text-destructive hover:underline',
  label,
  title,
  description,
  confirm,
  cancel,
  trigger,
}: {
  targetFormId: string;
  triggerClassName?: string;
  label?: string;
  title: string;
  description: string;
  confirm: string;
  cancel: string;
  trigger?: React.ReactElement;
}) {
  const btnId = useId();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (<button id={btnId} className={triggerClassName} type="button">{label}</button>)}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const form = document.getElementById(targetFormId) as HTMLFormElement | null;
              if (form) {
                if (typeof form.requestSubmit === 'function') form.requestSubmit();
                else form.submit();
              }
            }}
          >
            {confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
