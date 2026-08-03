"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

const ButtonSubmit = ({ value, ...props }) => {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      {...props}
      className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Uploading..." : value}
    </button>
  );
};

export default ButtonSubmit;
