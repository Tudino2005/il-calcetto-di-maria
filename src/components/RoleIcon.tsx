import Image from "next/image";

export default function RoleIcon({ role, className = "w-6 h-6", showText = false }: { role: string, className?: string, showText?: boolean }) {
  const r = role?.toLowerCase() || "";
  let src = "";
  let alt = role;

  if (r === "attaccante") {
    src = "/images/SoccerStriker.webp";
  } else if (r === "portiere") {
    src = "/images/goalkeeper.webp";
  } else if (r === "entrambi") {
    src = "/images/SoccerBoth.png";
  } else {
    // fallback
    return <span className={className}>{role}</span>;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-full h-full flex-shrink-0">
        <Image src={src} alt={alt} fill className="object-contain" />
      </div>
      {showText && <span className="text-xs uppercase tracking-wider font-bold">{role}</span>}
    </div>
  );
}
