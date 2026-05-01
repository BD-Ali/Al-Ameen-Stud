import React from 'react';
import {
  ArrowCounterClockwise, ArrowLeft, ArrowRight, ArrowSquareOut, ArrowsClockwise,
  Bell, Book, Briefcase,
  Calendar, CalendarBlank, CalendarX, Camera, CaretDown, CaretLeft, CaretRight, CaretUp,
  Carrot, ChartBar, Check, CheckCircle, CheckSquare, Checks, Clipboard, Clock,
  ClockCounterClockwise, Crosshair,
  Envelope, Eye,
  File, FileText, FloppyDisk,
  Gift, Globe, GraduationCap,
  Horse, Hourglass, House,
  Info,
  List, Lock,
  MagnifyingGlass, Megaphone, Money,
  PaperPlaneTilt, PencilSimple, Phone, Plus, PlusCircle, PushPin,
  Receipt,
  Shield, ShieldCheck, Stack,
  Ticket, Trash,
  User, UserCircle, Users,
  Wallet, Warning, Wrench,
  X, XCircle,
} from 'phosphor-react-native';

// Default icon weight — "regular" gives clean, balanced strokes
const DEFAULT_WEIGHT = 'regular';

// Default icon color — warm white for dark theme
const DEFAULT_COLOR = '#F8FAFC';

// Semantic name → Phosphor component
const SEMANTIC = {
  // People
  user: User, userCircle: UserCircle, userEdit: PencilSimple,
  userShield: ShieldCheck, users: Users,
  // Navigation
  home: House, back: CaretLeft, forward: CaretRight,
  chevronBack: CaretLeft, chevronForward: CaretRight,
  chevronDown: CaretDown, chevronUp: CaretUp, externalLink: ArrowSquareOut,
  // Actions
  add: Plus, addCircle: PlusCircle, edit: PencilSimple, save: FloppyDisk,
  trash: Trash, close: X, closeCircle: XCircle, search: MagnifyingGlass,
  send: PaperPlaneTilt, undo: ArrowCounterClockwise, camera: Camera, eye: Eye,
  // Communication
  mail: Envelope, phone: Phone, notifications: Bell,
  megaphone: Megaphone, globe: Globe,
  // Calendar / Time
  calendar: Calendar, calendarToday: CalendarBlank, calendarClear: CalendarX,
  clock: Clock, history: ClockCounterClockwise, hourglass: Hourglass,
  // Finance
  cash: Money, wallet: Wallet, receipt: Receipt, invoice: FileText,
  // Content
  book: Book, clipboard: Clipboard, document: File, list: List, pin: PushPin,
  // Status
  checkmark: Check, checkmarkCircle: CheckCircle, checkmarkDone: Checks,
  checkbox: CheckSquare, warning: Warning, info: Info,
  sync: ArrowsClockwise, locate: Crosshair,
  // Work / Role
  briefcase: Briefcase, construct: Wrench, school: GraduationCap,
  layers: Stack, barChart: ChartBar, tasks: CheckSquare,
  // Security
  lock: Lock, shield: Shield, shieldCheck: ShieldCheck,
  // Misc
  horse: Horse, gift: Gift, ticket: Ticket, nutrition: Carrot,
};

// Ionicons / legacy name → Phosphor component (backward-compat for all existing usages)
const COMPAT = {
  'add-circle-outline': PlusCircle,
  'add-outline': Plus,
  'arrow-back-outline': CaretLeft,
  'arrow-forward-outline': CaretRight,
  'arrow-undo-outline': ArrowCounterClockwise,
  'bar-chart-outline': ChartBar,
  'bell': Bell,
  'book-outline': Book,
  'briefcase-outline': Briefcase,
  'calendar-alt': Calendar,
  'calendar-clear-outline': CalendarX,
  'calendar-outline': Calendar,
  'call-outline': Phone,
  'camera-outline': Camera,
  'cash-outline': Money,
  'checkbox-outline': CheckSquare,
  'checkmark-circle-outline': CheckCircle,
  'checkmark-done-outline': Checks,
  'checkmark-outline': Check,
  'chevron-back-outline': CaretLeft,
  'chevron-down-outline': CaretDown,
  'chevron-forward-outline': CaretRight,
  'chevron-up-outline': CaretUp,
  'clipboard-outline': Clipboard,
  'close-circle-outline': XCircle,
  'close-outline': X,
  'construct-outline': Wrench,
  'create-outline': PencilSimple,
  'document-outline': File,
  'document-text-outline': FileText,
  'eye-outline': Eye,
  'gift-outline': Gift,
  'globe-outline': Globe,
  'home-outline': House,
  'hourglass-outline': Hourglass,
  'information-circle-outline': Info,
  'journal-outline': ClockCounterClockwise,
  'layers-outline': Stack,
  'list-outline': List,
  'locate-outline': Crosshair,
  'lock-closed-outline': Lock,
  'mail-outline': Envelope,
  'megaphone-outline': Megaphone,
  'notifications-outline': Bell,
  'nutrition-outline': Carrot,
  'open-outline': ArrowSquareOut,
  'paw-outline': Horse,
  'people-outline': Users,
  'person-circle-outline': UserCircle,
  'person-outline': User,
  'pin-outline': PushPin,
  'receipt-outline': Receipt,
  'save-outline': FloppyDisk,
  'school-outline': GraduationCap,
  'search-outline': MagnifyingGlass,
  'send-outline': PaperPlaneTilt,
  'shield-outline': Shield,
  'shield-checkmark-outline': ShieldCheck,
  'sync-outline': ArrowsClockwise,
  'ticket-outline': Ticket,
  'time-outline': Clock,
  'today-outline': CalendarBlank,
  'trash-outline': Trash,
  'wallet-outline': Wallet,
  'warning-outline': Warning,
};

/**
 * App-wide icon component powered by Phosphor icons.
 * To change an icon app-wide — update SEMANTIC or COMPAT above.
 *
 * @param {string}  name    Semantic key or legacy Ionicons name
 * @param {number}  size
 * @param {string}  color   Defaults to warm white — icons are monochromatic
 * @param {string}  weight  Phosphor weight: thin|light|regular|bold|fill|duotone
 * @param {object}  style
 */
export default function AppIcon({
  name,
  size = 20,
  color = DEFAULT_COLOR,
  weight = DEFAULT_WEIGHT,
  style,
}) {
  const Icon = SEMANTIC[name] ?? COMPAT[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} weight={weight} style={style} />;
}

