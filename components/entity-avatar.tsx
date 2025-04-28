import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Building,
  User,
  DollarSign,
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  MessageCircle,
  Calendar,
  Phone,
  Mail,
} from "lucide-react"

interface EntityAvatarProps {
  entity: "client" | "contact" | "deal" | "activity"
  name: string
  phase?: string
  value?: string | number
  stage?: string
  type?: string
  status?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function EntityAvatar({
  entity,
  name,
  value,
  phase,
  type,
  status,
  size = "md",
  className = "",
}: EntityAvatarProps) {
  // Determine avatar size
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  // Get initials from name
  const getInitials = (name: string | null | undefined) => {
    // If name is null, undefined, or not a string, return a default value
    if (!name || typeof name !== "string") {
      return "NA"
    }

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Get background color based on entity type or deal stage
  const getBgColor = () => {
    if (entity === "deal" && phase) {
      switch (phase.toLowerCase()) {
        case "discovery":
          return "bg-blue-500 text-white"
        case "proposal":
          return "bg-yellow-500 text-black"
        case "negotiation":
          return "bg-orange-500 text-white"
        case "closed won":
          return "bg-green-500 text-white"
        case "closed lost":
          return "bg-red-500 text-white"
        default:
          return "bg-gray-500 text-white"
      }
    }

    if (entity === "activity" && status) {
      switch (status.toLowerCase()) {
        case "completed":
          return "bg-green-500 text-white"
        case "scheduled":
          return "bg-blue-500 text-white"
        case "in progress":
          return "bg-orange-500 text-white"
        case "canceled":
          return "bg-red-500 text-white"
        case "pending":
          return "bg-yellow-500 text-black"
        default:
          return "bg-gray-500 text-white"
      }
    }

    switch (entity) {
      case "client":
        return "bg-blue-500 text-white"
      case "contact":
        return "bg-purple-500 text-white"
      case "deal":
        return "bg-green-500 text-white"
      case "activity":
        return "bg-indigo-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // Get icon based on entity type or deal stage
  const getIcon = () => {
    if (entity === "deal" && phase) {
      switch (phase.toLowerCase()) {
        case "discovery":
          return <MessageCircle className="h-4 w-4" />
        case "proposal":
          return <FileText className="h-4 w-4" />
        case "negotiation":
          return <Briefcase className="h-4 w-4" />
        case "closed won":
          return <CheckCircle className="h-4 w-4" />
        case "closed lost":
          return <XCircle className="h-4 w-4" />
        default:
          return <DollarSign className="h-4 w-4" />
      }
    }

    if (entity === "activity" && type) {
      switch (type.toLowerCase()) {
        case "meeting":
          return <Calendar className="h-4 w-4" />
        case "call":
          return <Phone className="h-4 w-4" />
        case "task":
          return <FileText className="h-4 w-4" />
        case "email":
          return <Mail className="h-4 w-4" />
        default:
          return <Calendar className="h-4 w-4" />
      }
    }

    switch (entity) {
      case "client":
        return <Building className="h-4 w-4" />
      case "contact":
        return <User className="h-4 w-4" />
      case "deal":
        return <DollarSign className="h-4 w-4" />
      case "activity":
        return <Calendar className="h-4 w-4" />
      default:
        return null
    }
  }

  // Generate image URL based on entity type
  const getImageUrl = () => {
    if (entity === "client") {
      // Use company logo placeholder
      return `/placeholder.svg?height=40&width=40&query=company logo for ${encodeURIComponent(name)}`
    } else if (entity === "contact") {
      // Use person avatar placeholder
      return `/placeholder.svg?height=40&width=40&query=professional headshot of person`
    } else {
      // For deals and activities, we'll use a fallback
      return null
    }
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={getImageUrl() || "/placeholder.svg"} alt={name} />
      <AvatarFallback className={getBgColor()}>
        {entity === "deal" ? getIcon() : entity === "activity" ? getIcon() : getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
