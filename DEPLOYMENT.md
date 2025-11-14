# Deployment Guide

This guide covers deploying the WealthRM application to various cloud platforms with automated CI/CD.

## Prerequisites

1. **Environment Variables**: Copy `.env.example` to `.env` and fill in all required values
2. **Docker**: Ensure Docker is installed for containerized deployments
3. **Git Repository**: Code should be pushed to a Git repository (GitHub, GitLab, etc.)

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
```

### Docker Local Testing

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t wealthrm-app .
docker run -p 5000:5000 --env-file .env wealthrm-app
```

## Cloud Platform Deployments

### 1. Railway

Railway provides automatic deployments on git push.

**Setup Steps:**

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment Variables**
   - In Railway dashboard, go to your service → Variables
   - Add all variables from `.env.example`

3. **Configure Build Settings**
   - Railway auto-detects Dockerfile
   - Or set build command: `npm run build`
   - Start command: `npm start`

4. **Deploy**
   - Railway automatically deploys on every push to main/master
   - Or use Railway CLI: `railway up`

**Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

### 2. Render

Render provides automatic deployments with zero-downtime.

**Setup Steps:**

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `wealthrm-app`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `.`
   - **Port**: `5000`

3. **Environment Variables**
   - Add all variables from `.env.example` in Render dashboard

4. **Auto-Deploy**
   - Render automatically deploys on push to main branch
   - Manual deploy: Click "Manual Deploy" in dashboard

### 3. AWS (Elastic Beanstalk / ECS)

**Elastic Beanstalk:**

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   eb init -p docker wealthrm-app
   eb create wealthrm-production
   ```

3. **Set Environment Variables**
   ```bash
   eb setenv SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

**ECS with Fargate:**

1. **Build and Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t wealthrm-app .
   docker tag wealthrm-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/wealthrm-app:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/wealthrm-app:latest
   ```

2. **Update ECS Service**
   - Use AWS Console or CLI to update service with new image

### 4. Google Cloud Run

**Setup Steps:**

1. **Install gcloud CLI**
   ```bash
   # Follow: https://cloud.google.com/sdk/docs/install
   ```

2. **Build and Push**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/wealthrm-app
   ```

3. **Deploy**
   ```bash
   gcloud run deploy wealthrm-app \
     --image gcr.io/PROJECT-ID/wealthrm-app \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "SUPABASE_URL=...,SUPABASE_SERVICE_ROLE_KEY=..."
   ```

### 5. Azure App Service

**Setup Steps:**

1. **Install Azure CLI**
   ```bash
   # Follow: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
   ```

2. **Create App Service**
   ```bash
   az group create --name wealthrm-rg --location eastus
   az acr create --resource-group wealthrm-rg --name wealthrmregistry --sku Basic
   az acr build --registry wealthrmregistry --image wealthrm-app:latest .
   ```

3. **Deploy**
   ```bash
   az webapp create --resource-group wealthrm-rg --plan wealthrm-plan --name wealthrm-app --deployment-container-image-name wealthrmregistry.azurecr.io/wealthrm-app:latest
   ```

### 6. DigitalOcean App Platform

**Setup Steps:**

1. **Connect Repository**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App" → "GitHub"
   - Select your repository

2. **Configure**
   - **Type**: Docker
   - **Dockerfile Path**: `Dockerfile`
   - **Port**: `5000`

3. **Environment Variables**
   - Add all variables in App Spec or dashboard

4. **Deploy**
   - Auto-deploys on push to main branch

## CI/CD with GitHub Actions

The repository includes GitHub Actions workflows for automated deployment:

- **`.github/workflows/deploy.yml`**: Main CI/CD pipeline (test, build, deploy)
- **`.github/workflows/deploy-railway.yml`**: Railway-specific deployment
- **`.github/workflows/deploy-render.yml`**: Render-specific deployment

### Setup GitHub Secrets

For automated deployments, add these secrets in GitHub Settings → Secrets:

**Railway:**
- `RAILWAY_TOKEN`: Your Railway API token
- `RAILWAY_SERVICE_ID`: Your Railway service ID

**Render:**
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID

**AWS:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ECS_CLUSTER`
- `AWS_ECS_SERVICE`

**Azure:**
- `AZURE_CREDENTIALS`: JSON with service principal

**GCP:**
- `GCP_SA_KEY`: Service account key JSON

## Environment Variables

All required environment variables are documented in `.env.example`. Ensure all variables are set in your cloud platform:

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SESSION_SECRET`
- `NODE_ENV`
- `PORT`

**Optional:**
- `SENDGRID_API_KEY`
- `OPENAI_API_KEY`
- `APP_URL`
- `API_URL`

## Health Checks

The application includes a health check endpoint:

```bash
curl http://your-domain.com/api/health
```

This endpoint is used by Docker health checks and load balancers.

## Monitoring

### Recommended Monitoring Tools

1. **Application Monitoring**
   - [Sentry](https://sentry.io) - Error tracking
   - [LogRocket](https://logrocket.com) - Session replay
   - [New Relic](https://newrelic.com) - APM

2. **Infrastructure Monitoring**
   - Platform-native monitoring (Railway, Render, AWS CloudWatch, etc.)
   - [UptimeRobot](https://uptimerobot.com) - Uptime monitoring

### Logging

Application logs are output to stdout/stderr. Configure log aggregation in your cloud platform:

- **Railway**: Automatic log aggregation
- **Render**: Automatic log aggregation
- **AWS**: CloudWatch Logs
- **GCP**: Cloud Logging
- **Azure**: Application Insights

## Troubleshooting

### Build Failures

1. **Check Node version**: Ensure Node.js 20+ is used
2. **Check dependencies**: Run `npm ci` locally to verify
3. **Check environment variables**: Ensure all required vars are set

### Runtime Errors

1. **Check logs**: View application logs in cloud platform dashboard
2. **Verify database connection**: Check Supabase credentials
3. **Check port binding**: Ensure PORT environment variable is set correctly

### Deployment Issues

1. **GitHub Actions**: Check Actions tab for error details
2. **Platform-specific**: Check platform deployment logs
3. **Docker**: Test Docker build locally first

## Security Best Practices

1. **Never commit `.env` files**
2. **Use secrets management** in your cloud platform
3. **Enable HTTPS** (most platforms do this automatically)
4. **Use strong SESSION_SECRET** (generate with `openssl rand -base64 32`)
5. **Enable RLS** in Supabase for database security
6. **Regular dependency updates**: Run `npm audit` regularly

## Scaling

### Horizontal Scaling

Most platforms support horizontal scaling:

- **Railway**: Auto-scaling based on traffic
- **Render**: Manual or auto-scaling
- **AWS ECS**: Auto-scaling groups
- **GCP Cloud Run**: Automatic scaling
- **Azure App Service**: Manual or auto-scaling

### Database Scaling

- Use Supabase connection pooling
- Consider read replicas for heavy read workloads
- Monitor query performance

## Backup Strategy

1. **Database Backups**: Configure Supabase automated backups
2. **Code Backups**: Git repository serves as code backup
3. **Environment Variables**: Document all env vars securely

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally with Docker first
4. Contact platform support if needed

