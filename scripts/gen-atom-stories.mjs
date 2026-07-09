// Generates facet-free "light" Storybook stories for every shadcn atom in
// components/ui, to populate the catalog. Import names are read from each source
// file so imports never break the build. High-value atoms get a curated render
// via OVERRIDES; the rest use a namespace import + bare primary render.
//
// Run: node scripts/gen-atom-stories.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'

const UI_DIR = join(process.cwd(), 'components', 'ui')

// filename (no ext) -> catalog category (drives the Storybook sidebar tree)
const CATEGORY = {
  accordion: 'Actions & Controls', button: 'Actions & Controls', 'button-group': 'Actions & Controls',
  toggle: 'Actions & Controls', 'toggle-group': 'Actions & Controls', 'dropdown-menu': 'Actions & Controls',
  'context-menu': 'Actions & Controls', menubar: 'Actions & Controls', command: 'Actions & Controls',
  tooltip: 'Actions & Controls', popover: 'Actions & Controls', 'hover-card': 'Actions & Controls',
  collapsible: 'Actions & Controls',
  field: 'Forms & Input', label: 'Forms & Input', input: 'Forms & Input', 'input-group': 'Forms & Input',
  textarea: 'Forms & Input', checkbox: 'Forms & Input', 'radio-group': 'Forms & Input', select: 'Forms & Input',
  'native-select': 'Forms & Input', combobox: 'Forms & Input', switch: 'Forms & Input', slider: 'Forms & Input',
  calendar: 'Forms & Input', 'input-otp': 'Forms & Input',
  'aspect-ratio': 'Layout & Navigation', breadcrumb: 'Layout & Navigation', 'navigation-menu': 'Layout & Navigation',
  pagination: 'Layout & Navigation', resizable: 'Layout & Navigation', 'scroll-area': 'Layout & Navigation',
  separator: 'Layout & Navigation', sidebar: 'Layout & Navigation', tabs: 'Layout & Navigation',
  drawer: 'Layout & Navigation', sheet: 'Layout & Navigation',
  avatar: 'Data Display', badge: 'Data Display', card: 'Data Display', carousel: 'Data Display',
  chart: 'Data Display', item: 'Data Display', kbd: 'Data Display', table: 'Data Display',
  alert: 'Feedback & Status', 'alert-dialog': 'Feedback & Status', dialog: 'Feedback & Status',
  empty: 'Feedback & Status', progress: 'Feedback & Status', skeleton: 'Feedback & Status',
  sonner: 'Feedback & Status', spinner: 'Feedback & Status',
  attachment: 'AI & Conversation', bubble: 'AI & Conversation', marker: 'AI & Conversation',
  message: 'AI & Conversation', 'message-scroller': 'AI & Conversation',
  direction: 'Utilities',
}

// Curated renders for high-value atoms. `imports` is inserted verbatim; `render`
// is the JSX returned by the story. `layout` overrides the default 'centered'.
const OVERRIDES = {
  badge: {
    imports: `import { Badge } from '@/components/ui/badge'`,
    render: `<div className="flex flex-wrap gap-2"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="destructive">Destructive</Badge><Badge variant="outline">Outline</Badge></div>`,
  },
  alert: {
    imports: `import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'`,
    render: `<Alert className="max-w-md"><AlertTitle>Heads up!</AlertTitle><AlertDescription>You can add components to your app using the CLI.</AlertDescription></Alert>`,
  },
  avatar: {
    imports: `import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'`,
    render: `<Avatar><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>`,
  },
  card: {
    imports: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'`,
    render: `<Card className="w-80"><CardHeader><CardTitle>Card title</CardTitle><CardDescription>Card description</CardDescription></CardHeader><CardContent>Card content goes here.</CardContent><CardFooter>Footer</CardFooter></Card>`,
  },
  checkbox: {
    imports: `import { Checkbox } from '@/components/ui/checkbox'\nimport { Label } from '@/components/ui/label'`,
    render: `<div className="flex items-center gap-2"><Checkbox id="terms" defaultChecked /><Label htmlFor="terms">Accept terms and conditions</Label></div>`,
  },
  switch: {
    imports: `import { Switch } from '@/components/ui/switch'\nimport { Label } from '@/components/ui/label'`,
    render: `<div className="flex items-center gap-2"><Switch id="airplane" defaultChecked /><Label htmlFor="airplane">Airplane mode</Label></div>`,
  },
  input: {
    imports: `import { Input } from '@/components/ui/input'`,
    render: `<Input className="w-64" placeholder="Email" />`,
  },
  textarea: {
    imports: `import { Textarea } from '@/components/ui/textarea'`,
    render: `<Textarea className="w-64" placeholder="Type your message..." />`,
  },
  label: {
    imports: `import { Label } from '@/components/ui/label'`,
    render: `<Label>Email address</Label>`,
  },
  slider: {
    imports: `import { Slider } from '@/components/ui/slider'`,
    render: `<Slider className="w-64" defaultValue={[50]} max={100} step={1} />`,
  },
  progress: {
    imports: `import { Progress } from '@/components/ui/progress'`,
    render: `<Progress className="w-64" value={60} />`,
  },
  skeleton: {
    imports: `import { Skeleton } from '@/components/ui/skeleton'`,
    render: `<div className="flex flex-col gap-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-32" /></div>`,
  },
  spinner: {
    imports: `import { Spinner } from '@/components/ui/spinner'`,
    render: `<Spinner />`,
  },
  kbd: {
    imports: `import { Kbd, KbdGroup } from '@/components/ui/kbd'`,
    render: `<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>`,
  },
  separator: {
    imports: `import { Separator } from '@/components/ui/separator'`,
    render: `<div className="w-64 text-sm">Above<Separator className="my-2" />Below</div>`,
  },
  tabs: {
    imports: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'`,
    render: `<Tabs defaultValue="account" className="w-80"><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList><TabsContent value="account">Account settings.</TabsContent><TabsContent value="password">Password settings.</TabsContent></Tabs>`,
  },
  accordion: {
    imports: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'`,
    render: `<Accordion className="w-80"><AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem></Accordion>`,
  },
  tooltip: {
    imports: `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'\nimport { Button } from '@/components/ui/button'`,
    render: `<TooltipProvider><Tooltip><TooltipTrigger render={<Button variant="outline">Hover me</Button>} /><TooltipContent>Add to library</TooltipContent></Tooltip></TooltipProvider>`,
  },
  'radio-group': {
    imports: `import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'\nimport { Label } from '@/components/ui/label'`,
    render: `<RadioGroup defaultValue="a"><div className="flex items-center gap-2"><RadioGroupItem value="a" id="ra" /><Label htmlFor="ra">Option A</Label></div><div className="flex items-center gap-2"><RadioGroupItem value="b" id="rb" /><Label htmlFor="rb">Option B</Label></div></RadioGroup>`,
  },
  toggle: {
    imports: `import { Toggle } from '@/components/ui/toggle'`,
    render: `<Toggle>Bold</Toggle>`,
  },
  'toggle-group': {
    imports: `import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'`,
    render: `<ToggleGroup><ToggleGroupItem value="a">A</ToggleGroupItem><ToggleGroupItem value="b">B</ToggleGroupItem><ToggleGroupItem value="c">C</ToggleGroupItem></ToggleGroup>`,
  },
  breadcrumb: {
    imports: `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'`,
    render: `<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>`,
  },
  pagination: {
    imports: `import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'`,
    render: `<Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#" /></PaginationItem><PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem><PaginationItem><PaginationNext href="#" /></PaginationItem></PaginationContent></Pagination>`,
  },
  item: {
    imports: `import { Item, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'`,
    render: `<Item className="w-80"><ItemContent><ItemTitle>Item title</ItemTitle><ItemDescription>Item description text.</ItemDescription></ItemContent></Item>`,
  },
  'input-otp': {
    imports: `import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'`,
    render: `<InputOTP maxLength={4}><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup></InputOTP>`,
  },
  calendar: {
    imports: `import { Calendar } from '@/components/ui/calendar'`,
    render: `<Calendar mode="single" className="rounded-md border" />`,
  },
  empty: {
    imports: `import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'`,
    render: `<Empty className="w-80"><EmptyHeader><EmptyTitle>No results</EmptyTitle><EmptyDescription>Nothing here yet.</EmptyDescription></EmptyHeader></Empty>`,
  },
  popover: {
    imports: `import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'\nimport { Button } from '@/components/ui/button'`,
    render: `<Popover><PopoverTrigger render={<Button variant="outline">Open</Button>} /><PopoverContent>Popover content.</PopoverContent></Popover>`,
  },
  'hover-card': {
    imports: `import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'\nimport { Button } from '@/components/ui/button'`,
    render: `<HoverCard><HoverCardTrigger render={<Button variant="link">@shadcn</Button>} /><HoverCardContent>The React framework catalog.</HoverCardContent></HoverCard>`,
  },
  'aspect-ratio': {
    imports: `import { AspectRatio } from '@/components/ui/aspect-ratio'`,
    render: `<div className="w-80"><AspectRatio ratio={16 / 9} className="flex items-center justify-center rounded-md bg-muted text-sm">16 : 9</AspectRatio></div>`,
  },
  'button-group': {
    imports: `import { ButtonGroup } from '@/components/ui/button-group'\nimport { Button } from '@/components/ui/button'`,
    render: `<ButtonGroup><Button variant="outline">Left</Button><Button variant="outline">Center</Button><Button variant="outline">Right</Button></ButtonGroup>`,
  },
  // Context-requiring roots: use namespace import so a name mismatch degrades to
  // an empty render instead of a build break, and wrap in the required provider.
  sidebar: {
    layout: 'fullscreen',
    imports: `import * as UI from '@/components/ui/sidebar'`,
    render: `<UI.SidebarProvider><UI.Sidebar><UI.SidebarHeader className="p-2">Header</UI.SidebarHeader><UI.SidebarContent><UI.SidebarGroup>Navigation</UI.SidebarGroup></UI.SidebarContent><UI.SidebarFooter className="p-2">Footer</UI.SidebarFooter></UI.Sidebar><main className="p-4"><UI.SidebarTrigger /> Content</main></UI.SidebarProvider>`,
  },
  chart: {
    imports: `import * as UI from '@/components/ui/chart'`,
    render: `<UI.ChartContainer config={{ value: { label: 'Value', color: 'var(--chart-1)' } }} className="h-40 w-80"><div /></UI.ChartContainer>`,
  },
}

function extractPrimary(src, file) {
  const names = new Set()
  const blockRe = /export\s*\{([\s\S]*?)\}/g
  let m
  while ((m = blockRe.exec(src))) {
    for (const raw of m[1].split(',')) {
      const id = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
      if (id) names.add(id)
    }
  }
  const fnRe = /export\s+(?:function|const)\s+(\w+)/g
  while ((m = fnRe.exec(src))) names.add(m[1])
  const comps = [...names].filter(
    (n) => /^[A-Z]/.test(n) && !/Variants$/.test(n) && !/Style$/.test(n) && !/^type$/.test(n),
  )
  const norm = (s) => s.replace(/[^a-z0-9]/gi, '').toLowerCase()
  const base = norm(basename(file, '.tsx'))
  return comps.find((n) => norm(n) === base) || comps[0]
}

function storyFile({ title, imports, render, layout }) {
  return `import type { Meta, StoryObj } from '@storybook/nextjs-vite'
${imports}

const meta = {
  title: '${title}',
  parameters: { layout: '${layout || 'centered'}' },
  tags: ['autodocs'],
  render: () => (
    ${render}
  ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
`
}

const files = readdirSync(UI_DIR).filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))
let written = 0
let skipped = 0
for (const f of files) {
  const name = basename(f, '.tsx')
  const outPath = join(UI_DIR, `${name}.stories.tsx`)
  if (existsSync(outPath)) {
    skipped++
    continue
  }
  const category = CATEGORY[name] || 'Uncategorized'
  const src = readFileSync(join(UI_DIR, f), 'utf8')
  const override = OVERRIDES[name]
  let imports, render, layout
  if (override) {
    imports = override.imports
    render = override.render
    layout = override.layout
  } else {
    const primary = extractPrimary(src, f)
    if (!primary) {
      console.warn(`! no component export found for ${f}, skipping`)
      skipped++
      continue
    }
    imports = `import * as UI from '@/components/ui/${name}'`
    render = `<UI.${primary} />`
  }
  const displayName = (override ? name : extractPrimary(src, f))
  const title = `Components/${category}/${toTitle(name)}`
  writeFileSync(outPath, storyFile({ title, imports, render, layout }))
  written++
}

function toTitle(kebab) {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

console.log(`Generated ${written} story files, skipped ${skipped} (existing).`)
