"use client";
import { Printer } from "lucide-react";

const PrintButton = ({ label = "Print / Save PDF" }) => (
  <button
    onClick={() => window.print()}
    className="btn-primary inline-flex items-center gap-2"
  >
    <Printer className="h-4 w-4" />
    {label}
  </button>
);

export default PrintButton;
