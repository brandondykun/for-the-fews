import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HoneypotFieldsProps {
  website: string;
  phone: string;
  onWebsiteChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export function HoneypotFields({
  website,
  phone,
  onWebsiteChange,
  onPhoneChange,
}: HoneypotFieldsProps) {
  return (
    <div
      className="absolute left-[-9999px] opacity-0 pointer-events-none"
      aria-hidden="true"
    >
      <Label htmlFor="website">Website</Label>
      <Input
        id="website"
        name="website"
        type="url"
        placeholder="Your website"
        value={website}
        onChange={(e) => onWebsiteChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
      <Label htmlFor="phone">Phone</Label>
      <Input
        id="phone"
        name="phone"
        type="tel"
        placeholder="Your phone number"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

// Custom hook for managing honeypot state
export function useHoneypot() {
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  const isBot = website || phone;

  return {
    website,
    phone,
    setWebsite,
    setPhone,
    isBot,
  };
}
