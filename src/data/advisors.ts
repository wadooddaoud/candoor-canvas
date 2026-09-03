import type { AdvisorRecord } from '../types'

const portrait = (name: string) => `https://raw.githubusercontent.com/wadooddaoud/candoor-canvas/main/public/advisors/${name}.webp`

export const advisors: AdvisorRecord[] = [
  {
    id: 'maya-chen', name: 'Maya Chen', pronouns: 'she/her',
    headline: 'AI product strategy & platform adoption', organization: 'Northstar Systems',
    bio: 'Product leader who helps teams turn technically ambitious AI programs into clear customer and executive narratives.',
    help: ['Executive storytelling', 'AI platform strategy', 'Promotion narratives'],
    expertise: ['product management', 'artificial intelligence', 'platforms', 'executive communication'],
    industries: ['technology', 'enterprise software'], companyFamiliarity: ['OpenAI', 'Anthropic', 'Google'],
    avatar: portrait('maya-chen'), isDemo: true,
  },
  {
    id: 'marcus-reed', name: 'Marcus Reed', pronouns: 'he/him',
    headline: 'Product leadership, metrics & influence', organization: 'Harbor Product Studio',
    bio: 'Former operator turned coach focused on quantifying product impact and leading through complex stakeholder systems.',
    help: ['Impact metrics', 'Stakeholder influence', 'Leadership interviews'],
    expertise: ['product leadership', 'metrics', 'stakeholder management', 'career strategy'],
    industries: ['technology', 'financial services'], companyFamiliarity: ['Stripe', 'Block', 'OpenAI'],
    avatar: portrait('marcus-reed'), isDemo: true,
  },
  {
    id: 'priya-nair', name: 'Priya Nair', pronouns: 'she/her',
    headline: 'Technical product & developer platforms', organization: 'Relay Works',
    bio: 'Technical product advisor specializing in developer experience, API ecosystems, and cross-functional operating models.',
    help: ['Technical storytelling', 'Platform roadmaps', 'System design interviews'],
    expertise: ['developer platforms', 'apis', 'technical product management', 'roadmaps'],
    industries: ['developer tools', 'enterprise software'], companyFamiliarity: ['OpenAI', 'GitHub', 'Microsoft'],
    avatar: portrait('priya-nair'), isDemo: true,
  },
  {
    id: 'elena-torres', name: 'Elena Torres', pronouns: 'she/her',
    headline: 'Go-to-market storytelling for builders', organization: 'Signal & Story',
    bio: 'Narrative strategist who helps product leaders make complex work legible, memorable, and commercially relevant.',
    help: ['Portfolio narrative', 'Executive presence', 'Case-study structure'],
    expertise: ['storytelling', 'go-to-market', 'positioning', 'executive communication'],
    industries: ['technology', 'media'], companyFamiliarity: ['OpenAI', 'Canva', 'Notion'],
    avatar: portrait('elena-torres'), isDemo: true,
  },
  {
    id: 'david-okafor', name: 'David Okafor', pronouns: 'he/him',
    headline: 'Responsible AI programs & operations', organization: 'Fieldwork Advisory',
    bio: 'AI operations leader helping candidates express risk, governance, and scaled delivery as business impact.',
    help: ['Responsible AI', 'Program leadership', 'Operating cadence'],
    expertise: ['artificial intelligence', 'operations', 'governance', 'program management'],
    industries: ['technology', 'healthcare'], companyFamiliarity: ['OpenAI', 'Microsoft', 'Amazon'],
    avatar: portrait('david-okafor'), isDemo: true,
  },
  {
    id: 'samira-bell', name: 'Samira Bell', pronouns: 'they/them',
    headline: 'Career positioning for product leaders', organization: 'Common Thread Collective',
    bio: 'Career advisor helping senior operators sharpen their market story and prepare for high-signal interviews.',
    help: ['Career positioning', 'Interview loops', 'Offer strategy'],
    expertise: ['career strategy', 'product management', 'interviewing', 'leadership'],
    industries: ['technology', 'consumer products'], companyFamiliarity: ['Airbnb', 'OpenAI', 'Figma'],
    avatar: portrait('samira-bell'), isDemo: true,
  },
]
