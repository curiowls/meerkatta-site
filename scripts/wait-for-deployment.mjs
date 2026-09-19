const expectedCommit = process.env.DEPLOY_COMMIT?.trim()
const markerUrl = 'https://meerkatta.com/deployment-version.txt'
const attempts = Number(process.env.DEPLOY_POLL_ATTEMPTS || 60)
const intervalMs = Number(process.env.DEPLOY_POLL_INTERVAL_MS || 10_000)

if (!/^[0-9a-f]{40}$/i.test(expectedCommit || '')) {
  throw new Error('DEPLOY_COMMIT must be a full Git commit SHA')
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const response = await fetch(`${markerUrl}?check=${Date.now()}`, {
      headers: {'cache-control': 'no-cache'},
    })
    const deployedCommit = response.ok ? (await response.text()).trim() : ''

    if (deployedCommit === expectedCommit) {
      console.log(`Hostinger deployed ${expectedCommit}`)
      process.exit(0)
    }

    console.log(
      `Waiting for Hostinger (${attempt}/${attempts}); live marker is ${deployedCommit || `HTTP ${response.status}`}`,
    )
  } catch (error) {
    console.log(`Waiting for Hostinger (${attempt}/${attempts}); ${error.message}`)
  }

  if (attempt < attempts) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

throw new Error(`Hostinger did not deploy ${expectedCommit} within the polling window`)
