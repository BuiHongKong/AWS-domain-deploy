# Food Delivery System - AWS Fargate

Food delivery platform built on AWS Fargate with customer and admin dashboards.

## Overview

This project is a **Food Delivery MVP** system featuring:
- **Customer Dashboard**: Browse menu, add to cart, place orders, track order status
- **Admin Dashboard**: Manage orders, menu items, restaurants, and view statistics
- **API Service**: Node.js/Express API running on ECS Fargate
- **Database**: DynamoDB for orders, menu items, and restaurants

## Quick Start

👉 **See [FOOD_DELIVERY_README.md](./FOOD_DELIVERY_README.md) for complete documentation**

## Project Structure

```
├── api/                    # API service (Node.js/Express)
├── customer-dashboard/     # Customer-facing React app
├── admin-dashboard/        # Admin React app
├── terraform/              # Infrastructure as Code (ECS, ALB, DynamoDB)
├── sample-data/            # Sample restaurants and menu items
└── scripts/                # Utility scripts (seed data, etc.)
```

## Local Development

1. **Setup Database** - See [FOOD_DELIVERY_README.md](./FOOD_DELIVERY_README.md#local-development)
2. **Seed Sample Data** - Run `scripts/seed-data.js`
3. **Start Services** - See [FOOD_DELIVERY_README.md](./FOOD_DELIVERY_README.md#local-development)

## Documentation

- **[FOOD_DELIVERY_README.md](./FOOD_DELIVERY_README.md)** - Complete project documentation
- **[sample-data/README.md](./sample-data/README.md)** - Sample data guide

## Technology Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: AWS DynamoDB
- **Infrastructure**: AWS ECS Fargate, ALB, Terraform
- **Region**: ap-southeast-1 (Singapore)
