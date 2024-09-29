#!/usr/bin/env -S deno run --location https://jpg241.dev.archive.org --no-check --allow-read=. --allow-write=. --allow-net --allow-run --allow-import --watch

import httpd from 'https://deno.land/x/httpd/mod.js'
import { warn } from 'https://av.prod.archive.org/js/util/log.js'
import {
  exe, esc, ARRAY, CONTINUE,
} from 'https://av.prod.archive.org/js/util/cmd.js'


httpd(async (req, headers) => {
  const url = new URL(req.url)
  let fi
  try {
    if (url.search?.includes('preview') || url.pathname.endsWith('/preview'))
      fi = Deno.realPathSync(url.pathname.slice(1).replace(/\/preview$/, ''))
  } catch (error) {
    warn({ error })
  }
  // only allow production or testing image dir file access
  if (!fi?.startsWith('/app/img/') && !fi?.startsWith('/Users/tracey/dev/jpg241/img/'))
    return new Response('xxx', { headers }) // 404 for you

  // now look for Start of Sequence (SOS) marker 0xFFDA in the file - there should be 6
  // for IA made progressive JPEGs (one for each scan).  The first scan is full resolution
  // but very very blocky, w/ approximated colors, etc.  We can cut the file off there,
  // but in testing 300 images, (just) one didn't have enough information
  // (likely unlucky random FFDA sequence).  So, cutoff after second scan.
  // hexdump file to long string of [0-9a-f] chars -- then show where `ffda` appears in file
  const cmd = `xxd -p -c0 ${esc(fi)} | grep -o --byte-offset ffda -m3 | cut -f1 -d:`
  warn(cmd)
  // NOTE: weirdly, have seen it return *4* hits, even though "-m3".  So test ">= 3" below..
  const hits = await exe(cmd, ARRAY, CONTINUE)
  warn({ fi, hits })
  // If we saw the start of at least 3 scans, cutoff the file after first two scans.
  // Divide by two, since each byte was transformed above to two hexadecimal (ASCII) chars.
  const nbytes = Number(hits.length >= 3 ? hits[2] : 0) / 2

  headers.set('content-type', 'image/jpeg; charset=UTF-8')
  headers.set('strict-transport-security', 'max-age=3600')
  headers.set('content-length', nbytes || Deno.statSync(fi).size)

  if (nbytes) {
    // send the preview
    warn({ fi, nbytes })
    const p = await (new Deno.Command('bash', { stdin: 'piped', stdout: 'piped' })).spawn()
    const writer = await p.stdin.getWriter()
    await writer.write(new TextEncoder().encode(`head -c ${nbytes} ${esc(fi)}`))
    await writer.releaseLock()
    await p.stdin.close()

    // eslint-disable-next-line consistent-return
    return new Response((await p.output()).stdout, { headers })
  }

  // may not be a progressive JPEG - send the entire file
  // eslint-disable-next-line consistent-return
  return new Response(await Deno.readFile(fi), { headers, type: 'opaque' })
})
