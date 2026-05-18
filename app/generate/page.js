'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const COMPANY_TYPES = ['Startup','Scale-up','SME','Enterprise','Agency','Non-profit']

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [form, setForm]       = useState({ role:'', department:'', company_name:'', company_type:'Startup', tools:'', responsibilities:'', manager_name:'' })

  useEffect(() => {
    try {
      const match = document.cookie.match(/tra_user=([^;]+)/)
      if (match) setUser(JSON.parse(decodeURIComponent(match[1])))
    } catch(e) {}
  }, [])

  const handleSubmit = async () => {
    if (!form.role || !form.company_name) return setError('Role and company name are required.')
    setLoading(true); setError(''); setResult(null)
    try {
      const token = document.cookie.match(/tra_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, color:'#0f172a', background:'#fff', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }
  const labelStyle = { fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5 }

  if (result) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>T</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Trailday</span>
        </Link>
        <div style={{flex:1}}/>
      </nav>
      <div style={{maxWidth:760,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#15803d',textTransform:'uppercase',marginBottom:4}}>✅ Onboarding Plan Ready</p>
          <p style={{fontSize:20,fontWeight:800,color:'#0f172a'}}>{form.role} — {form.company_name}</p>
          {form.manager_name && <p style={{fontSize:13,color:'#64748b'}}>Manager: {form.manager_name}</p>}
        </div>
        {(result.overview || result.plan_overview) && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>📋 Overview</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.overview || result.plan_overview}</p>
        </div>}
        {(result.week_1 || result.first_week || result.weeks) && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:12}}>📅 Onboarding Schedule</p>
          {result.weeks ? Object.entries(result.weeks).map(([week, tasks]) => (
            <div key={week} style={{marginBottom:14,paddingBottom:14,borderBottom:'1px solid #f1f5f9'}}>
              <p style={{fontSize:13,fontWeight:700,color:'#16a34a',marginBottom:6}}>{week}</p>
              {Array.isArray(tasks) ? tasks.map((t,i) => (
                <div key={i} style={{display:'flex',gap:8,marginBottom:4}}>
                  <span style={{color:'#16a34a',fontSize:11,marginTop:2}}>✓</span>
                  <p style={{fontSize:12,color:'#374151'}}>{typeof t === 'string' ? t : t.task || JSON.stringify(t)}</p>
                </div>
              )) : <p style={{fontSize:12,color:'#374151'}}>{tasks}</p>}
            </div>
          )) : null}
        </div>}
        {result.milestones && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:10}}>🎯 Key Milestones</p>
          {Array.isArray(result.milestones) ? result.milestones.map((m,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
              <span style={{color:'#16a34a',fontSize:12,marginTop:2,fontWeight:700}}>{i+1}.</span>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{typeof m === 'string' ? m : m.milestone || JSON.stringify(m)}</p>
            </div>
          )) : <p style={{fontSize:13,color:'#374151'}}>{result.milestones}</p>}
        </div>}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => window.print()} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #bbf7d0',background:'#f0fdf4',fontSize:13,fontWeight:600,color:'#15803d',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>📕 Print / PDF</button>
          <button onClick={() => { setResult(null); setForm({role:'',department:'',company_name:'',company_type:'Startup',tools:'',responsibilities:'',manager_name:''}) }} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>New plan</button>
          {user ? <Link href="/dashboard" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#16a34a',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Dashboard →</Link>
                : <Link href="/login" style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'#16a34a',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Save plans →</Link>}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>T</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Trailday</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#16a34a',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:680,margin:'0 auto',padding:'40px 24px'}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Generate onboarding plan</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Fill in the role details and get a complete, structured onboarding plan in seconds.</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div><label style={labelStyle}>Role / Job title *</label><input value={form.role} onChange={e => setForm({...form,role:e.target.value})} placeholder="e.g. Frontend Developer" style={inputStyle}/></div>
            <div><label style={labelStyle}>Department</label><input value={form.department} onChange={e => setForm({...form,department:e.target.value})} placeholder="e.g. Engineering" style={inputStyle}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div><label style={labelStyle}>Company name *</label><input value={form.company_name} onChange={e => setForm({...form,company_name:e.target.value})} placeholder="e.g. Acme Corp" style={inputStyle}/></div>
            <div><label style={labelStyle}>Company type</label>
              <select value={form.company_type} onChange={e => setForm({...form,company_type:e.target.value})} style={{...inputStyle,background:'#fff'}}>
                {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Manager name</label>
            <input value={form.manager_name} onChange={e => setForm({...form,manager_name:e.target.value})} placeholder="e.g. Sarah Chen" style={inputStyle}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Tools & systems they'll use</label>
            <input value={form.tools} onChange={e => setForm({...form,tools:e.target.value})} placeholder="e.g. Slack, Notion, Jira, Figma, GitHub" style={inputStyle}/>
          </div>
          <div style={{marginBottom:24}}>
            <label style={labelStyle}>Key responsibilities</label>
            <textarea value={form.responsibilities} onChange={e => setForm({...form,responsibilities:e.target.value})}
              placeholder="Describe the main responsibilities of the role..."
              rows={4} style={{...inputStyle,resize:'vertical'}}/>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#86efac':'#16a34a',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {loading ? '⚙️ Generating plan...' : 'Generate onboarding plan →'}
          </button>
        </div>
      </div>
    </div>
  )
}
