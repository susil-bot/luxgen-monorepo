# 🌐 Subdomain Setup for Local Development

This guide explains how to set up subdomain support for local development with the tenant system.

## 🚀 Quick Setup

### Option 1: Using /etc/hosts (Recommended)

1. **Edit your hosts file**:
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add these lines**:
   ```
   127.0.0.1 localhost
   127.0.0.1 demo.localhost
   127.0.0.1 ideavibes.localhost
   127.0.0.1 acme-corp.localhost
   ```

3. **Save and restart your browser**

### Option 2: Using dnsmasq (Advanced)

1. **Install dnsmasq**:
   ```bash
   # macOS
   brew install dnsmasq
   
   # Ubuntu/Debian
   sudo apt-get install dnsmasq
   ```

2. **Configure dnsmasq**:
   ```bash
   echo "address=/.localhost/127.0.0.1" | sudo tee -a /etc/dnsmasq.conf
   ```

3. **Start dnsmasq**:
   ```bash
   sudo brew services start dnsmasq  # macOS
   sudo systemctl start dnsmasq      # Linux
   ```

## 🧪 Testing Subdomains

After setup, you can test:

- `http://localhost:3000/groups` → Demo tenant (default)
- `http://demo.localhost:3000/groups` → Demo tenant
- `http://ideavibes.localhost:3000/groups` → Idea Vibes tenant
- `http://acme-corp.localhost:3000/groups` → ACME Corporation tenant

## 🔧 Development Server

Start the development server:

```bash
npm run dev
```

The server will run on `http://localhost:3000` and all subdomains will work.

## 🎯 Expected Behavior

### Demo Tenant (`demo.localhost:3000`)
- **Logo**: Colorful pinwheel logo
- **Text**: "LuxGen"
- **Colors**: Blue (#3B82F6)

### Idea Vibes Tenant (`ideavibes.localhost:3000`)
- **Logo**: Lightbulb with creative elements
- **Text**: "Idea Vibes"
- **Colors**: Purple (#8B5CF6)

### ACME Corporation (`acme-corp.localhost:3000`)
- **Logo**: ACME logo (to be added)
- **Text**: "ACME"
- **Colors**: Red (#DC2626)

## 🐛 Troubleshooting

### Issue: "This site can't be reached"
**Solution**: Make sure you've added the subdomains to `/etc/hosts`

### Issue: "404 Not Found"
**Solution**: 
1. Restart your browser after editing hosts file
2. Clear browser cache
3. Try incognito/private mode

### Issue: Subdomain not working
**Solution**:
1. Check `/etc/hosts` file has correct entries
2. Restart browser
3. Try `ping ideavibes.localhost` to test DNS resolution

## 🚀 Production Deployment

For production, configure your DNS to point subdomains to your server:

```
demo.yourdomain.com → Your Server
ideavibes.yourdomain.com → Your Server
acme-corp.yourdomain.com → Your Server
```

The Next.js application will automatically detect the subdomain and load the appropriate tenant configuration.
