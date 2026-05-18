import { NextResponse } from 'next/server'
export async function POST(request) {
  try {
    const body = await request.json()
    const { role, department, company_name, company_type, tools, responsibilities, manager_name, userId } = body
    if (!role || !company_name) return NextResponse.json({ error: 'Role and company name are required' }, { status: 400 })
    const aiRes = await fetch(`${process.env.AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ task: 'generate_onboarding_plan', inputs: { role, department: department||'General', company_name, company_type: company_type||'Company', tools: tools||'Standard tools', responsibilities: responsibilities||'To be defined', manager_name: manager_name||'Their manager' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI failed')
    const result = aiData.data
    let itemId = null
    if (userId && process.env.DB_API_URL) {
      try {
        const dbRes = await fetch(`${process.env.DB_API_URL}/db/trailday/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_TRAILDAY}` },
          body: JSON.stringify({ user_id: userId, title: `${role} — ${company_name}`, role, company_name, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) {}
    }
    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
