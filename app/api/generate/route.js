import { NextResponse } from 'next/server'

const AI_API_URL = process.env.AI_API_URL
const AI_API_KEY = process.env.AI_API_KEY
const DB_API_URL = process.env.DB_API_URL
const DB_API_KEY = process.env.DB_API_KEY_TRAILDAY

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, role, department, company_name, company_type, tools, responsibilities, manager_name } = body

    // Call AI API

    // Check usage limits
    if (userId) {
      const usageRes = await fetch(`${process.env.DB_API_URL}/usage/check?user_id=${userId}&product=trailday`, {
        headers: { 'Authorization': `Bearer ${process.env.DB_API_KEY_TRAILDAY}` }
      })
      const usage = await usageRes.json()
      if (!usage.allowed) {
        return NextResponse.json({
          error: 'limit_reached',
          message: `You've used all ${usage.limit} free generations this month. Upgrade to continue.`,
          used: usage.used,
          limit: usage.limit,
          upgrade_url: '/billing'
        }, { status: 402 })
      }
    }

    const aiRes = await fetch(`${AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({ task: 'generate_onboarding_plan', inputs: { role, department: department||'General', company_name, company_type: company_type||'Company', tools: tools||'Standard tools', responsibilities: responsibilities||'To be defined', manager_name: manager_name||'Their manager' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI generation failed')

    const result = aiData.data

    // Track usage
    if (userId) {
      fetch(`${process.env.DB_API_URL}/usage/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_TRAILDAY}` },
        body: JSON.stringify({ user_id: userId, product: 'trailday', action: 'generate' })
      }).catch(() => {})
    }


    // Save to DB
    let itemId = null
    if (userId && DB_API_URL) {
      try {
        const dbRes = await fetch(`${DB_API_URL}/db/trailday/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DB_API_KEY}` },
          body: JSON.stringify({ user_id: userId, title: `${role} — ${company_name}`, role, company_name, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) { console.error('DB save failed:', e.message) }
    }

    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
