import { useLocationsStore } from '@/shared/store/locations.store'

/** Tool definitions sent to OpenRouter */
export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_locations',
      description: 'Search restaurants, cafes, bars from the GastroMap database',
      parameters: {
        type: 'object',
        properties: {
          city:             { type: 'string', description: 'City name (e.g. Krakow)' },
          cuisine_types:    { type: 'array',  items: { type: 'string' }, description: 'e.g. ["Italian","Polish"]' },
          tags:             { type: 'array',  items: { type: 'string' }, description: 'Vibe/atmosphere tags e.g. ["cozy","romantic"]' },
          category:         { type: 'string', enum: ['restaurant','cafe','bar','bakery','other'] },
          price_range:      { type: 'array',  items: { type: 'string', enum: ['$','$$','$$$','$$$$'] } },
          dietary_options:  { type: 'array',  items: { type: 'string' } },
          min_rating:       { type: 'number', minimum: 0, maximum: 5 },
          keyword:          { type: 'string', description: 'Free-text search' },
          max_results:      { type: 'number', default: 5 },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_location_details',
      description: 'Get full details of a specific location by ID',
      parameters: {
        type: 'object',
        properties: { location_id: { type: 'string' } },
        required: ['location_id'],
      },
    },
  },
]

/** Execute tool call — runs locally against Zustand store */
export function executeTool(name, args) {
  const store = useLocationsStore.getState()
  switch (name) {
    case 'search_locations':
      return store.searchForAI(args)
    case 'get_location_details':
      return store.locations.find((l) => l.id === args.location_id) || null
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
