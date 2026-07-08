# 🚀 TCCFlow Migration Guide: Netlify → Hostinger

Complete step-by-step guide to migrate TCCFlow from Netlify to Hostinger Business (with cPanel + Node.js).

---

## 📋 Pre-Migration Checklist

Before starting, ensure you have:

- [ ] Hostinger Business account with cPanel access
- [ ] FTP credentials from Hostinger
- [ ] Domain `tccflow.com.br` transferred/configured in Hostinger
- [ ] All environment variables noted (see `.env-hostinger-example`)
- [ ] Current site backed up (git clone)
- [ ] Netlify site still running (for rollback)

---

## 🔑 Step 1: Gather Environment Variables

Get these from their respective services:

1. **Supabase**
   - Go to: Supabase Dashboard → Project Settings → API
   - Copy: `URL` and `Service Role Key` (secret!)
   - Save as: `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

2. **Mercado Pago**
   - Go to: Mercado Pago → Configurações → Credenciais
   - Copy: Access Token (prod or sandbox)
   - Save as: `MERCADOPAGO_ACCESS_TOKEN`

3. **Groq** (AI)
   - Go to: Groq Console → API Keys
   - Copy: Your API key
   - Save as: `GROQ_KEY`

4. **Site URL**
   - Should be: `https://tccflow.com.br`

---

## 📁 Step 2: Prepare Files for Upload

Create a deployment package:

```bash
# On your computer, in TCCFlow directory:

# 1. Copy package.json for Hostinger
cp package-hostinger.json package.json

# 2. Copy .htaccess template
cp .htaccess-hostinger .htaccess

# 3. Copy .env template and fill it
cp .env-hostinger-example .env
# Edit .env with your actual credentials

# 4. Create deployment folder
mkdir tccflow-hostinger
cp -r pages/ css/ js/ src/ assets/ *.html *.json *.js .env .htaccess tccflow-hostinger/
cp -r netlify/ tccflow-hostinger/

# 5. Verify structure
ls tccflow-hostinger/
# Should show: pages/, css/, js/, src/, assets/, netlify/, server.js, package.json, .env, .htaccess, etc
```

---

## 🌐 Step 3: Access Hostinger cPanel

1. Go to **Hostinger Dashboard** → Click your domain
2. Click **Manage** → **cPanel** (or direct cPanel link)
3. Log in with your Hostinger credentials

You should see the cPanel dashboard.

---

## 📤 Step 4: Upload Files to Hostinger

### Option A: Using cPanel File Manager (Recommended for beginners)

1. In cPanel → **File Manager**
2. Navigate to `public_html` folder (should be empty or have default content)
3. Delete all default files (index.html, etc) if present
4. Click **Upload** → Choose entire `tccflow-hostinger/` folder
5. Upload all files (this may take 2-5 minutes)

### Option B: Using FTP (Faster for large uploads)

1. In cPanel → **FTP Accounts** (or check welcome email for FTP credentials)
2. Use FTP client (FileZilla, WinSCP) to connect:
   - **Host:** Your Hostinger FTP address
   - **Username:** FTP username from cPanel
   - **Password:** FTP password
   - **Port:** 21 (or 22 if SFTP)
3. Navigate to `public_html` folder
4. Upload all files from `tccflow-hostinger/` folder
5. Ensure directory structure is preserved

### Option C: Using Git (If cPanel supports Git)

1. In cPanel → **Git Version Control** (if available)
2. Clone your repository:
   ```
   https://github.com/pedrogentile13-hash/TCCFlow.git
   ```
3. This will pull the latest code automatically

---

## ⚙️ Step 5: Configure Node.js App in Hostinger

1. In cPanel → Search for **"Node.js App Manager"** or **"Node.js"**
2. Click **Create Node.js App**
3. Fill in:
   - **App mode:** Production
   - **Node.js version:** 18.x or 20.x
   - **App URL:** Leave blank (uses domain)
   - **App startup file:** `server.js`
   - **Application root:** `/home/yourusername/public_html`
4. Click **Create**
5. The app should start automatically

---

## ✅ Step 6: Configure Environment Variables (in cPanel)

1. In cPanel Node.js App Manager, click your app name
2. Look for **"Environment Variables"** section
3. Add each variable:

   ```
   SUPABASE_URL=https://fpqvubixlsblanbyppkp.supabase.co
   SUPABASE_SERVICE_KEY=your_actual_key_here
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
   GROQ_KEY=gsk_xxxxx
   URL=https://tccflow.com.br
   NODE_ENV=production
   PORT=3000
   ```

4. Click **Save**
5. Restart the app

---

## 🧪 Step 7: Test Your Setup

### Test 1: Check Site Loads
```bash
curl https://tccflow.com.br
# Should return HTML of your landing page
```

### Test 2: Check API Health
```bash
curl https://tccflow.com.br/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test 3: Test Coupon Validation
```bash
curl -X POST https://tccflow.com.br/api/validate-coupon \
  -H "Content-Type: application/json" \
  -d '{"code":"TESTCOUPON"}'
# Should return coupon validation result
```

### Test 4: Full Payment Flow
1. Go to https://tccflow.com.br/plans
2. Try to create a payment with a test coupon
3. Check Mercado Pago webhook log to confirm it hits your server

---

## 🔄 Step 8: Update Mercado Pago Webhooks

**IMPORTANT:** Update your payment processor to send webhooks to Hostinger:

1. Go to **Mercado Pago Dashboard** → **Webhooks** (or Notificaciones)
2. Find your webhook configuration
3. Change URL from:
   ```
   https://tccflow.netlify.app/.netlify/functions/mp-webhook
   ```
   To:
   ```
   https://tccflow.com.br/api/mp-webhook
   ```
4. Save and test webhook delivery

---

## 🔀 Step 9: DNS Cutover (Point Domain to Hostinger)

### If domain is already at Hostinger:
Just ensure it's pointing to the correct nameservers (usually set automatically).

### If domain is elsewhere (GoDaddy, Namecheap, etc):

1. Go to your domain registrar
2. Update **Nameservers** to Hostinger's:
   ```
   ns1.hostinger.com
   ns2.hostinger.com
   ns3.hostinger.com
   ```
3. Wait 24-48 hours for DNS to propagate

### Check DNS Propagation:
```bash
# On your computer:
nslookup tccflow.com.br
# Should show Hostinger's IP
```

---

## ✨ Step 10: Verify Everything Works

Test these critical flows:

- [ ] Landing page loads
- [ ] Login works (Google OAuth via Supabase)
- [ ] Dashboard loads user data
- [ ] Coupon validation works
- [ ] Payment creation works
- [ ] AI chat responds (test /api/tccflow-ai)
- [ ] User data persists in Supabase
- [ ] HTTPS works (green lock icon)

---

## 🚨 Troubleshooting

### Issue: Node.js app won't start
**Solution:** Check logs in cPanel Node.js App Manager
- Look for errors in "Error Log"
- Ensure all env vars are set correctly
- Verify `server.js` exists in root

### Issue: API returns 404
**Solution:** 
- Check that Express routes match (`/api/validate-coupon`, etc)
- Verify `.htaccess` is in `public_html`
- Check Node.js app is running

### Issue: Mercado Pago webhook fails
**Solution:**
- Verify webhook URL is updated: `https://tccflow.com.br/api/mp-webhook`
- Check cPanel error logs
- Test webhook delivery in Mercado Pago dashboard

### Issue: Supabase connection errors
**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check Supabase firewall allows Hostinger IP
- Test connection: `curl -H "Authorization: Bearer $KEY" $URL/rest/v1/`

### Issue: Static files (CSS, JS) not loading
**Solution:**
- Ensure all files are uploaded to `public_html`
- Check `.htaccess` allows static file serving
- Verify file paths in HTML are relative (not absolute)

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

1. **Keep Netlify running** for the first 48 hours
2. Update DNS back to Netlify's nameservers
3. Wait 24 hours for propagation
4. Revert Mercado Pago webhooks to Netlify URL

---

## 📞 Support Resources

- **Hostinger cPanel Help:** https://support.hostinger.com/en/categories/6 
- **Node.js Docs:** https://nodejs.org/docs/
- **Express.js Docs:** https://expressjs.com/
- **Supabase Docs:** https://supabase.com/docs

---

## ✅ Final Checklist

Before considering migration complete:

- [ ] Site loads on Hostinger domain
- [ ] All 47 HTML pages accessible
- [ ] API endpoints return 200 status
- [ ] Payments work end-to-end
- [ ] AI chat functional
- [ ] User data persists
- [ ] No 500 errors in logs
- [ ] HTTPS working
- [ ] DNS fully propagated (24-48h)
- [ ] Netlify can be disabled

---

**Estimated time:** 2-4 hours (depending on upload speed)

**Good luck!** 🎉
