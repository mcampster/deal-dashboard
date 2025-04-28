import {
  Archive,
  BarChart3,
  Building2,
  Briefcase,
  Calendar,
  Download,
  DollarSign,
  Edit,
  FileJson,
  GitMerge,
  Home,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Settings,
  Upload,
  User,
  Database,
  BookOpen,
  Users,
  BarChart4,
  Columns,
} from "lucide-react"

// Icon mapping - centralized icon registry
export const iconMap = {
  // Dataset icons
  dollar: DollarSign,
  user: User,
  building: Building2,
  mail: Mail,
  phone: Phone,
  briefcase: Briefcase,
  mapPin: MapPin,
  calendar: Calendar,
  "file-json": FileJson,
  book: BookOpen,
  users: Users,
  charts: BarChart4,
  columns: Columns,

  // Navigation icons
  home: Home,
  dashboard: LayoutDashboard,
  chart: BarChart3,
  settings: Settings,
  database: Database,

  // Action icons
  plus: Plus,
  upload: Upload,
  download: Download,
  edit: Edit,
  refresh: RefreshCw,
  archive: Archive,
  "git-merge": GitMerge,
}

export type IconName = keyof typeof iconMap
