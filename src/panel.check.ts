import { defineCheck } from 'orca/testing'

// The panel is plain HTML with a standalone demo fallback, so one scenario is enough.
export default defineCheck({
  fresh: {},
})
