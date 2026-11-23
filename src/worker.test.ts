import { assert, mockHost, mountWorker, test } from 'orca/testing'
import * as main from './worker'

test('serves the run snapshot with a fresh timestamp', async () => {
  const host = mockHost({})
  const worker = await mountWorker(main, { host })
  const data: any = await worker.request('team.data')
  assert.equal(data.run, 'RTEAMDEM01')
  assert.equal(data.members.length, 4)
  assert.equal(data.parts.length, 5)
  assert.equal(data.actors.length, 4)
  assert.equal(data.flows.length, 9)
  assert.ok(data.generatedAt > 0)
  assert.deepEqual(worker.refusals, [])
  await worker.deactivate()
})
