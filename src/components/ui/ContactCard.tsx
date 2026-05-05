import type { ContactListItem } from "@/types/contact";
import { getDisplayName } from "@/lib/utils/contact";

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

interface ContactCardProps {
  contact: ContactListItem;
}

export function ContactCard({ contact }: ContactCardProps) {
  const displayName = getDisplayName(contact);
  const initials = getInitials(contact.firstName, contact.lastName);
  const avatarColor = stringToColor(displayName);

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header: avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 truncate">{displayName}</h3>
          {contact.profession && (
            <p className="text-sm text-gray-500 truncate">
              {contact.profession}
              {contact.company && <span className="text-gray-400"> · {contact.company}</span>}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm">
        {contact.city && (
          <div className="flex items-start gap-2 text-gray-600">
            <span className="leading-5">📍</span>
            <span className="truncate font-medium">{contact.city}</span>
          </div>
        )}

        {contact.currentAddress && contact.currentAddress !== contact.city && (
          <div className="flex items-start gap-2 text-gray-500 text-xs">
            <span className="leading-5">🏠</span>
            <span className="line-clamp-2">{contact.currentAddress}</span>
          </div>
        )}

        {contact.permanentAddress && (
          <div className="flex items-start gap-2 text-gray-500 text-xs">
            <span className="leading-5">🏡</span>
            <span className="line-clamp-2">
              <span className="text-gray-400">Permanent: </span>
              {contact.permanentAddress}
            </span>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>📱</span>
            <a
              href={`tel:${contact.phone}`}
              className="text-indigo-600 hover:underline truncate"
            >
              {contact.phone}
            </a>
          </div>
        )}

        {contact.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>✉️</span>
            <a
              href={`mailto:${contact.email}`}
              className="text-indigo-600 hover:underline truncate"
            >
              {contact.email}
            </a>
          </div>
        )}
      </div>

      {/* Social link */}
      {contact.socialLink && (
        <a
          href={contact.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline mt-auto pt-1"
        >
          View Profile →
        </a>
      )}
    </div>
  );
}
