from flask import Flask, request, render_template_string
import pickle
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

import os

app = Flask(__name__)


loaded = pickle.load(open("energy_consumption_model.pkl", "rb"))

data = pd.read_csv("Energy_consumption.csv")


# ===============================
# Calculations
# ===============================
TOTAL_CONSUMPTION = round(data["EnergyConsumption"].sum(), 2)

MAX_CONSUMPTION = data["EnergyConsumption"].max() * len(data)
CONSUMPTION_PERCENT = int((TOTAL_CONSUMPTION / MAX_CONSUMPTION) * 100)


# HOME PAGE
@app.route("/")
def home():
    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EnergyFlow - Smart Energy Solutions</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
    
        :root {
          --background: #ffffff;
          --foreground: #0f1419;
          --primary: #1a1d24;
          --primary-foreground: #f8f9fa;
          --secondary: #f4f5f7;
          --muted: #6b7280;
          --accent: #e67e22;
          --dark-surface: #1a1d24;
          --dark-card: #24272e;
          --border: #e5e7eb;
        }
    
        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--foreground);
          background: var(--background);
          line-height: 1.6;
        }
    
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', Georgia, serif;
        }
    
        .heading-display {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
        }
    
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
    
        /* Header */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 24px 0;
        }
    
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
    
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
        }
    
        .logo svg {
          width: 24px;
          height: 24px;
        }
    
        .nav {
          display: none;
          gap: 32px;
        }
    
        @media (min-width: 768px) {
          .nav {
            display: flex;
          }
        }
    
        .nav a {
          color: rgba(248, 249, 250, 0.8);
          text-decoration: none;
          transition: color 0.3s;
        }
    
        .nav a:hover {
          color: var(--primary-foreground);
        }
    
        .btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }
    
        .btn-outline-light {
          background: transparent;
          border: 1px solid rgba(248, 249, 250, 0.5);
          color: var(--primary-foreground);
        }
    
        .btn-outline-light:hover {
          background: var(--primary-foreground);
          color: var(--primary);
        }
    
        .btn-primary {
          background: var(--primary);
          color: var(--primary-foreground);
        }
    
        .btn-primary:hover {
          opacity: 0.9;
        }
    
        .btn-outline-dark {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
        }
    
        .btn-outline-dark:hover {
          background: var(--foreground);
          color: var(--background);
        }
    
        /* Hero Section */
        .hero {
          background: var(--dark-surface);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
    
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, var(--dark-surface), rgba(26, 29, 36, 0.95), transparent);
          z-index: 10;
        }
    
        .hero-image {
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero .container {
          width: 100%;
          display: flex;
          justify-content: flex-start; /* LEFT ALIGN */
        }
    
        .hero-content {
          position: relative;
          z-index: 20;
          max-width: 600px;
          padding-top: 96px;
          text-align: left;
        }
    
        .hero h1 {
          font-size: clamp(40px, 6vw, 72px);
          color: var(--primary-foreground);
          line-height: 1.1;
          margin-bottom: 24px;
        }
    
        .hero p {
          color: rgba(248, 249, 250, 0.7);
          font-size: 18px;
          max-width: 400px;
          margin-bottom: 40px;
        }
    
        /* Solutions Section */
        .solutions {
          padding: 96px 0;
          background: var(--background);
        }
    
        .solutions-grid {
          display: grid;
          gap: 64px;
          align-items: start;
        }
    
        @media (min-width: 1024px) {
          .solutions-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
    
        .solutions h2 {
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 24px;
        }
    
        .solutions > .container > .solutions-grid > div:first-child p {
          color: var(--muted);
          max-width: 400px;
        }
    
        .solutions-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
    
        .solution-card {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 24px;
          text-align: center;
        }
    
        .solution-card h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }
    
        .solution-card p {
          font-size: 14px;
          color: var(--muted);
        }
    
        /* Features Section */
        .features {
          background: var(--dark-surface);
          padding: 96px 0;
        }
    
        .features-grid {
          display: grid;
          gap: 32px;
        }
    
        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
    
        .feature-card {
          background: var(--dark-card);
          border-radius: 8px;
          padding: 48px 24px;
          text-align: center;
        }
    
        .icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          background: radial-gradient(circle at center, var(--dark-card) 0%, transparent 70%);
        }
    
        .icon-circle svg {
          width: 32px;
          height: 32px;
          color: rgba(248, 249, 250, 0.8);
        }
    
        .feature-card h3 {
          color: var(--primary-foreground);
          font-size: 20px;
          margin-bottom: 12px;
        }
    
        .feature-card p {
          color: rgba(248, 249, 250, 0.6);
          font-size: 14px;
          max-width: 280px;
          margin: 0 auto;
        }
    
        /* Partner Section */
        .partner {
          padding: 96px 0;
          background: var(--background);
        }
    
        .partner-grid {
          display: grid;
          gap: 64px;
          align-items: center;
        }
    
        @media (min-width: 1024px) {
          .partner-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
    
        .label-accent {
          color: var(--accent);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
    
        .partner h2 {
          font-size: clamp(32px, 4vw, 48px);
          margin-top: 16px;
          margin-bottom: 24px;
        }
    
        .partner p {
          color: var(--muted);
          max-width: 400px;
          margin-bottom: 32px;
        }
    
        .partner-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 8px;
        }
    
        /* Expertise Section */
        .expertise {
          padding: 96px 0;
          background: var(--secondary);
        }
    
        .expertise-header {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 48px;
        }
    
        @media (min-width: 768px) {
          .expertise-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
    
        .expertise h2 {
          font-size: clamp(32px, 4vw, 48px);
          margin-top: 16px;
        }
    
        .expertise-cards {
          display: grid;
          gap: 24px;
        }
    
        @media (min-width: 768px) {
          .expertise-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }
    
        .expertise-card {
          position: relative;
          height: 350px;
          border-radius: 8px;
          overflow: hidden;
        }
    
        .expertise-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
    
        .expertise-card:hover img {
          transform: scale(1.05);
        }
    
        .expertise-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2), transparent);
        }
    
        .expertise-card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
        }
    
        .expertise-card h3 {
          color: var(--primary-foreground);
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }
    
        .expertise-card p {
          color: rgba(248, 249, 250, 0.7);
          font-size: 14px;
        }
    
        /* Future Energy Section */
        .future-energy {
          background: var(--dark-surface);
          padding: 96px 0;
        }
    
        .future-energy-header {
          text-align: center;
          margin-bottom: 64px;
        }
    
        .future-energy h2 {
          color: var(--primary-foreground);
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 16px;
        }
    
        .future-energy-header p {
          color: rgba(248, 249, 250, 0.6);
          max-width: 600px;
          margin: 0 auto;
        }
    
        .future-card {
          background: var(--dark-card);
          border-radius: 8px;
          padding: 40px 24px;
          text-align: center;
        }
    
        .future-card h3 {
          color: var(--primary-foreground);
          font-size: 20px;
          margin-bottom: 8px;
        }
    
        .future-card .subtitle {
          color: rgba(248, 249, 250, 0.5);
          font-size: 14px;
          margin-bottom: 16px;
        }
    
        .future-card .description {
          color: rgba(248, 249, 250, 0.7);
          font-size: 14px;
          max-width: 280px;
          margin: 0 auto;
        }
    
        /* Newsletter Section */
        .newsletter {
          display: grid;
        }
    
        @media (min-width: 1024px) {
          .newsletter {
            grid-template-columns: 1fr 1fr;
          }
        }
    
        .newsletter-dark {
          background: var(--dark-surface);
          padding: 96px 24px;
        }
    
        .newsletter-dark-inner {
          max-width: 480px;
          margin-left: 0;
          margin-right: auto;
        }
    
        @media (min-width: 1024px) {
          .newsletter-dark-inner {
            margin-left: auto;
            margin-right: 0;
          }
        }
    
        .newsletter-dark h2 {
          color: var(--primary-foreground);
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 24px;
        }
    
        .newsletter-dark > .newsletter-dark-inner > p {
          color: rgba(248, 249, 250, 0.6);
          margin-bottom: 40px;
        }
    
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: rgba(36, 39, 46, 0.5);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
    
        .benefit-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(230, 126, 34, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
    
        .benefit-icon svg {
          width: 20px;
          height: 20px;
          color: var(--accent);
        }
    
        .benefit-item p {
          color: rgba(248, 249, 250, 0.8);
          font-size: 14px;
        }
    
        .newsletter-light {
          background: var(--secondary);
          padding: 96px 24px;
        }
    
        .newsletter-light-inner {
          max-width: 480px;
          margin: 0 auto;
        }
    
        @media (min-width: 1024px) {
          .newsletter-light-inner {
            margin-right: auto;
            margin-left: 0;
          }
        }
    
        .newsletter-light .label {
          font-weight: 500;
          color: var(--foreground);
        }
    
        .newsletter-light h2 {
          font-size: clamp(28px, 3vw, 36px);
          margin-top: 16px;
          margin-bottom: 24px;
        }
    
        .newsletter-light > .newsletter-light-inner > p {
          color: var(--muted);
          margin-bottom: 40px;
        }
    
        .form-group {
          margin-bottom: 16px;
        }
    
        .form-group label {
          display: block;
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 8px;
        }
    
        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 16px;
          background: var(--background);
        }
    
        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }
    
        .btn-full {
          width: 100%;
          padding: 16px 24px;
        }
        
        /* Footer */
        .footer {
          background: var(--background);
          padding: 64px 0;
          border-top: 1px solid var(--border);
        }
    
        .footer-grid {
          display: grid;
          gap: 48px;
        }
    
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
    
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
        }
    
        .footer-logo svg {
          width: 24px;
          height: 24px;
        }
    
        .footer-section p {
          color: var(--muted);
          font-size: 14px;
        }
    
        .footer-section h4 {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          margin-bottom: 16px;
        }
    
        .footer-section ul {
          list-style: none;
        }
    
        .footer-section ul li {
          margin-bottom: 12px;
        }
    
        .footer-section ul a {
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }
    
        .footer-section ul a:hover {
          color: var(--foreground);
        }
    
        .footer-bottom {
          border-top: 1px solid var(--border);
          margin-top: 48px;
          padding-top: 32px;
          text-align: center;
        }
    
        .footer-bottom p {
          color: var(--muted);
          font-size: 14px;
        }
        /* TYPEWRITER TEXT */
        .typewriter {
          color: #ffffff;
          position: relative;
        }
    
        /* BLINKING CURSOR */
        .typewriter::after {
          content: "|";
          margin-left: 4px;
          animation: blink 1s infinite;
          opacity: 0.8;
        }
        
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        
    
      </style>
    </head>
    <body>
    
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="header-inner">
            <a href="#" class="logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              EnergyFlow
            </a>
            
            <nav class="nav">
              <a class="help-btn" href="/">Home</a>
              <a class="help-btn" href="/learning">Learning</a>
              <a class="help-btn" href="/overviews">Overviews</a>
              <a class="help-btn" href="/contact">Contact</a>
            </nav>
            
            <a href="#" class="btn btn-outline-light">Learn More</a>
          </div>
        </div>
      </header>
    
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-overlay"></div>
        <img src="/static/images/img2.png" alt="Energy facility" class="hero-image">
        <div class="container">
          <div class="hero-content">
            <h1 class="heading-display">
              <span class="typewriter"></span>
              Solutions for a
            </h1>
            <p>
              At our website, we are dedicated to providing cutting-edge smart energy solutions
              that empower individuals and businesses to reduce their carbon footprint and achieve
            </p>
            <a href="#one" class="btn btn-outline-light">Explore Now</a>
          </div>
        </div>
      </section>
    
      <!-- Solutions Section -->
      <section class="solutions" id="one">
        <div class="container">
          <div class="solutions-grid">
            <div>
              <h2 class="heading-display">About Our Solutions</h2>
              <p>
                Our smart energy solutions leverage advanced data analytics, IoT
                integration, and intelligent automation to deliver unprecedented
                visibility and control over your energy consumption
              </p>
            </div>
            <div class="solutions-cards">
              <div class="solution-card">
                <h3 class="heading-display">Intelligent</h3>
                <p>Optimize energy use and reduce costs with our</p>
              </div>
              <div class="solution-card">
                <h3 class="heading-display">Distributed</h3>
                <p>Harness renewable energy</p>
              </div>
              <div class="solution-card">
                <h3 class="heading-display">Energy Efficiency</h3>
                <p>Unlock your energy-</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <div class="features-grid">
            <div class="feature-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 class="heading-display">Innovative Technology</h3>
              <p>Cutting-edge solutions for smarter energy management</p>
            </div>
            <div class="feature-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <h3 class="heading-display">Scalable Platforms</h3>
              <p>Tailored for businesses of all sizes</p>
            </div>
            <div class="feature-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 class="heading-display">Proven Results</h3>
              <p>Measurable impact on your energy costs and carbon</p>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Partner Section -->
      <section class="partner">
        <div class="container">
          <div class="partner-grid">
            <div>
              <span class="label-accent">Partner with Us</span>
              <h2 class="heading-display">
                Transforming Energy<br>
                Efficiency Together
              </h2>
              <p>
                At our company, we believe that smart energy solutions are the key to a
                sustainable future. By partnering with us, you'll gain access to the latest
                technologies, expert guidance
              </p>
              <a href="#" class="btn btn-primary">Get Started</a>
            </div>
            <div>
              <img src="/static/images/i1.png" alt="Energy facility" class="partner-image">
            </div>
          </div>
        </div>
      </section>
    
      <!-- Expertise Section -->
      <section class="expertise">
        <div class="container">
          <div class="expertise-header">
            <div>
              <span class="label-accent">Our Expertise</span>
              <h2 class="heading-display">Empowering Sustainable Solutions</h2>
            </div>
            <a href="/learning" class="btn btn-outline-dark">Discover More</a>
          </div>
          <div class="expertise-cards">
            <div class="expertise-card">
              <img src="/static/images/img3.png" alt="Wind turbines">
              <div class="expertise-card-overlay"></div>
              <div class="expertise-card-content">
                <h3>Wind Power Integration</h3>
                <p>Harnessing clean wind energy for sustainable solutions</p>
              </div>
            </div>
            <div class="expertise-card">
              <img src="/static/images/img4.png" alt="Solar panels">
              <div class="expertise-card-overlay"></div>
              <div class="expertise-card-content">
                <h3>Solar Technology</h3>
                <p>Advanced photovoltaic systems for maximum efficiency</p>
              </div>
            </div>
            <div class="expertise-card">
              <img src="/static/images/img5.png" alt="Wind turbine sunset">
              <div class="expertise-card-overlay"></div>
              <div class="expertise-card-content">
                <h3>Sustainable Future</h3>
                <p>Building tomorrow's energy infrastructure today</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Future Energy Section -->
      <section class="future-energy">
        <div class="container">
          <div class="future-energy-header">
            <h2 class="heading-display">Driving the Future of Energy</h2>
            <p>
              Our innovative smart energy solutions are designed to empower businesses and
              individuals to take control of their energy consumption, reduce costs
            </p>
          </div>
          <div class="features-grid">
            <div class="future-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                
              </div>
              <h3 class="heading-display">Smart Building</h3>
              <p class="subtitle">Optimize energy use and enhance efficiency</p>
              <p class="description">Leverage data-driven insights to transform your energy management strategies.</p>
            </div>
            <div class="future-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <h3 class="heading-display">Renewable Energy</h3>
              <p class="subtitle">Harness the power of renewable sources</p>
              <p class="description">Achieve greater self-sufficiency and reduce reliance on the grid.</p>
            </div>
            <div class="future-card">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 class="heading-display">Energy Efficiency</h3>
              <p class="subtitle">Unlock hidden savings and drive sustainability</p>
              <p class="description">Benefit from our expertise in optimizing your energy consumption.</p>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Newsletter Section -->
      <section class="newsletter">
        <div class="newsletter-dark">
          <div class="newsletter-dark-inner">
            <h2 class="heading-display">
              Empowering a<br>
              Sustainable
            </h2>
            <p>
              At our website, we are committed to providing innovative
              smart energy solutions that not only reduce your energy
            </p>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
                
              </div>
              <p>Discover how our solutions can help you become a leader in energy efficiency and sustainability</p>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <p>Take the first step towards a more sustainable tomorrow.</p>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <p>Our team of energy experts are ready to partner with you and guide you through the journey</p>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="9" y1="18" x2="15" y2="18"></line>
                  <line x1="10" y1="22" x2="14" y2="22"></line>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>
              <p>Together, we can unlock the full potential of smart energy and drive meaningful</p>
            </div>
          </div>
        </div>
        
        <div class="newsletter-light">
          <div class="newsletter-light-inner">
            <span class="label">Stay Connected</span>
            <h2 class="heading-display">
              Explore Our Energy-<br>
              Saving Solutions
            </h2>
            <p>
              Sign up for our newsletter to stay informed about the latest
              advancements in smart energy technology and learn how you
              can optimize your energy consumption and reduce your carbon
            </p>
            
            <form>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email">
              </div>
              <button type="submit" class="btn btn-primary btn-full">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    
      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-section">
              <a href="#" class="footer-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                EnergyFlow
              </a>
              <p>Transforming energy efficiency for a sustainable future.</p>
            </div>
            
            <div class="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/learning">Learning</a></li>
                <li><a href="/overviews">Overviews</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h4>Connect With Us</h4>
              <ul>
                <li><a href="#">LinkedIn</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Instagram</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>© 2026 EnergyFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <script>
      const words = [
        "Smarter Tomorrow",
        "Sustainable Future",
        "Greener World",
        "Efficient Living"
      ];
    
      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      
      const speed = 140;       // typing speed
      const deleteSpeed = 220; // deleting speed
      const holdTime = 1600;
    
      const target = document.querySelector(".typewriter");
    
      function typeEffect() {
        const currentWord = words[wordIndex];
    
        if (!isDeleting) {
          target.textContent = currentWord.substring(0, charIndex + 1);
          charIndex++;
    
          if (charIndex === currentWord.length) {
            setTimeout(() => isDeleting = true, delay);
          }
        } else {
          target.textContent = currentWord.substring(0, charIndex - 1);
          charIndex--;
    
          if (charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }
    
        setTimeout(typeEffect, isDeleting ? deleteSpeed : speed);
      }
    
      typeEffect();
    </script>
    
    </body>
    </html>
    """)




def generate_hvac_boxplot():
    plt.figure(figsize=(8, 6))
    plt.style.use("dark_background")

    ax = plt.gca()
    ax.set_facecolor("#020617")

    data.boxplot(
        column="EnergyConsumption",
        by="HVACUsage",
        ax=ax,
        grid=False,
        patch_artist=True,
        boxprops=dict(facecolor="#22c55e", alpha=0.6),
        medianprops=dict(color="white"),
        whiskerprops=dict(color="#94a3b8"),
        capprops=dict(color="#94a3b8")
    )

    plt.title("HVAC Usage vs Energy Consumption", color="white", pad=14)
    plt.suptitle("")
    plt.xlabel("HVAC Usage", color="#94a3b8")
    plt.ylabel("Energy Consumption (kWh)", color="#94a3b8")

    ax.tick_params(colors="#94a3b8")

    os.makedirs("static", exist_ok=True)
    plt.tight_layout()
    plt.savefig(
        "static/HVAC Usage vs Energy Consumption1.png",
        dpi=300,
        facecolor="#020617"
    )
    plt.close()
generate_hvac_boxplot()
# PREDICTION PAGE
@app.route("/overviews",methods=["GET", "POST"])
def overviews():
    data["Date"] = pd.to_datetime(data["Timestamp"])
    prediction = None

    if request.method == "POST":
        features = [
            float(request.form["Temperature"]),
            float(request.form["Humidity"]),
            float(request.form["SquareFootage"]),
            float(request.form["Occupancy"]),
            float(request.form["HVACUsage"]),
            float(request.form["LightingUsage"]),
            float(request.form["RenewableEnergy"])
        ]
        features = np.array(features).reshape(1, -1)
        prediction = round(loaded.predict(features)[0])
    energy_values = data["EnergyConsumption"].tolist()
    labels = list(range(len(energy_values)))
    corr = data.select_dtypes(include=[np.number]).corr()
    corr_data = corr.values.tolist()
    corr_labels = corr.columns.tolist()

    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EnergyFlow - Smart Energy Solutions</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
    
        :root {
          --background: #020617;
          --foreground: #f8f9fa;
          --primary: #1a1d24;
          --primary-foreground: #f8f9fa;
          --secondary: #f4f5f7;
          --muted: #6b7280;
          --accent: #e67e22;
          --dark-surface: #1a1d24;
          --dark-card: #24272e;
          --border: #e5e7eb;
        }
    
        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--foreground);
          background: var(--background);
          line-height: 1.6;
          padding-top: 100px;
        }
    
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', Georgia, serif;
        }
    
        .heading-display {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
        }
    
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
    
        /* Header */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 24px 0;
          background: var(--background);
        }
    
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
    
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
        }
    
        .logo svg {
          width: 24px;
          height: 24px;
        }
    
        .nav {
          display: none;
          gap: 32px;
        }
    
        @media (min-width: 768px) {
          .nav {
            display: flex;
          }
        }
    
        .nav a {
          color: rgba(248, 249, 250, 0.8);
          text-decoration: none;
          transition: color 0.3s;
        }
    
        .nav a:hover {
          color: var(--primary-foreground);
        }
    
        .btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }
    
        .btn-outline-light {
          background: transparent;
          border: 1px solid rgba(248, 249, 250, 0.5);
          color: var(--primary-foreground);
        }
    
        .btn-outline-light:hover {
          background: var(--primary-foreground);
          color: var(--primary);
        }
    
        .btn-primary {
          background: var(--primary);
          color: var(--primary-foreground);
        }
    
        .btn-primary:hover {
          opacity: 0.9;
        }
    
        .btn-outline-dark {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
        }
    
        .btn-outline-dark:hover {
          background: var(--foreground);
          color: var(--background);
        }
        /* Footer */
        .footer {
          background: var(--background);
          padding: 64px 0;
          border-top: 1px solid var(--border);
        }
    
        .footer-grid {
          display: grid;
          gap: 48px;
        }
    
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
    
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
        }
    
        .footer-logo svg {
          width: 24px;
          height: 24px;
        }
    
        .footer-section p {
          color: var(--muted);
          font-size: 14px;
        }
    
        .footer-section h4 {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          margin-bottom: 16px;
        }
    
        .footer-section ul {
          list-style: none;
        }
    
        .footer-section ul li {
          margin-bottom: 12px;
        }
    
        .footer-section ul a {
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }
    
        .footer-section ul a:hover {
          color: var(--foreground);
        }
    
        .footer-bottom {
          border-top: 1px solid var(--border);
          margin-top: 48px;
          padding-top: 32px;
          text-align: center;
        }
    
        .footer-bottom p {
          color: var(--muted);
          font-size: 14px;
        }
        .container { padding: 30px 40px; }

        .grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 25px;
        }
        
        .card {
            background: #020617;
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 0 30px rgba(34,197,94,0.08);
        }
        
        /* Circular Gauge */
        .circle {
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: conic-gradient(#22c55e {{ consumption_percent }}%, #0f172a 0);
            display: flex;
            justify-content: center;
            align-items: center;
            margin: auto;
        }
        
        .circle-inner {
            width: 170px;
            height: 170px;
            border-radius: 50%;
            background: #020617;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .circle-inner h2 {
            margin: 0;
            font-size: 36px;
            color: #22c55e;
        }
        
        img {
            width: 100%;
            border-radius: 12px;
        }
        
        /* Prediction */
        input {
            width: 100%;
            padding: 10px;
            margin: 8px 0;
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: 8px;
            color: white;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: #22c55e;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
        }
        
        .result {
            margin-top: 15px;
            text-align: center;
            color: #22c55e;
            font-size: 18px;
        }
        .card-image {
          padding: 0;
          overflow: hidden;
        }
        
        .card-image h3 {
          padding: 20px 24px;
          margin: 0;
          color: #f8f9fa;
          background: transparent;
        }
        
        .card-media {
          width: 100%;
          height: 100%;
          max-height: 520px;        /* controls visual size */
          padding: 16px 24px 24px; /* spacing inside card */
        }
        
        .card-media img {
          width: 100%;
          height: 100%;
          object-fit: contain;     /* IMPORTANT for heatmap */
          border-radius: 12px;
          background: #020617;
        }


        </style>
        </head>
        <body>
            <!-- Header -->
            <header class="header">
              <div class="container">
                <div class="header-inner">
                  <a href="#" class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    EnergyFlow
                  </a>
                  
                  <nav class="nav">
                    <a href="/">Home</a>
                    <a href="/learning">Learning</a>
                    <a href="/overviews">Overviews</a>
                    <a href="/contact">Contact</a>
                  </nav>
                  
                  <a href="#" class="btn btn-outline-light">Learn More</a>
                </div>
              </div>
            </header>
            <div class="container">
            <div class="grid">
                <div class="card">
                    <h3>Total Energy Consumption</h3>
                    <div class="circle">
                        <div class="circle-inner">
                            <h2>{{ total_consumption }}</h2>
                            <span>kWh</span>
                        </div>
                    </div>
                </div>
            
                <div class="card">
                    <h3>Date vs Energy Consumption</h3>
                    <canvas id="energyChart" height="120"></canvas>
                </div>
            </div>
            
            <br>
            
            <div class="grid">
                <div class="card card-image">
                  <h3>Correlation Heatmap</h3>
                  <div class="card-media">
                    <div id="correlationHeatmap" style="height: 420px;"></div>
                  </div>
                </div>
            
                <div class="card">
                    <h3>HVAC vs Consumption</h3>
                    <img src="/static/HVAC Usage vs Energy Consumption.png">
                </div>
            </div>
            
            <br>
            
            <div class="card">
            <h3>🔮 Predict Energy Consumption</h3>
            
            <form method="POST">
            <input name="Temperature" placeholder="Temperature" required>
            <input name="Humidity" placeholder="Humidity" required>
            <input name="SquareFootage" placeholder="Square Footage" required>
            <input name="Occupancy" placeholder="Occupancy" required>
            <input name="HVACUsage" placeholder="HVAC Usage" required>
            <input name="LightingUsage" placeholder="Lighting Usage" required>
            <input name="RenewableEnergy" placeholder="Renewable Energy" required>
            <button type="submit">Predict</button>
            </form>
            
            {% if prediction %}
            <div class="result">
            Predicted Consumption: <b>{{ prediction }} kWh</b>
            </div>
            {% endif %}
            </div>
            
            </div>
            <!-- Footer -->
            <footer class="footer">
              <div class="container">
                <div class="footer-grid">
                  <div class="footer-section">
                    <a href="#" class="footer-logo">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      EnergyFlow
                    </a>
                    <p>Transforming energy efficiency for a sustainable future.</p>
                  </div>
                  
                  <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                      <li><a href="/">Home</a></li>
                      <li><a href="/learning">Learning</a></li>
                      <li><a href="/overviews">Overviews</a></li>
                      <li><a href="/contact">Contact</a></li>
                    </ul>
                  </div>
                  
                  <div class="footer-section">
                    <h4>Connect With Us</h4>
                    <ul>
                      <li><a href="#">LinkedIn</a></li>
                      <li><a href="#">Twitter</a></li>
                      <li><a href="#">Facebook</a></li>
                      <li><a href="#">Instagram</a></li>
                    </ul>
                  </div>
                  
                  <div class="footer-section">
                    <h4>Legal</h4>
                    <ul>
                      <li><a href="#">Privacy Policy</a></li>
                      <li><a href="#">Terms of Service</a></li>
                      <li><a href="#">Cookie Policy</a></li>
                    </ul>
                  </div>
                </div>
                
                <div class="footer-bottom">
                  <p>© 2026 EnergyFlow. All rights reserved.</p>
                </div>
              </div>
            </footer>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

            <script>
            const ctx = document.getElementById('energyChart').getContext('2d');
            
            const energyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: {{ labels | safe }},
                    datasets: [{
                        label: 'Energy Consumption (kWh)',
                        data: {{ energy_values | safe }},
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.25)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#22c55e'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.parsed.y} kWh`;
                                }
                            }
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#94a3b8' },
                            grid: { display: false }
                        },
                        y: {
                            ticks: { color: '#94a3b8' },
                            grid: { color: 'rgba(148,163,184,0.15)' }
                        }
                    }
                }
            });
            </script>
            <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
            <script>
            Plotly.newPlot(
                "correlationHeatmap",
                [{
                    z: {{ corr_data | safe }},
                    x: {{ corr_labels | safe }},
                    y: {{ corr_labels | safe }},
                    type: "heatmap",
                    colorscale: "Viridis",
                    hoverongaps: false
                }],
                {
                    paper_bgcolor: "#020617",
                    plot_bgcolor: "#020617",
                    font: { color: "white" },
                    margin: { t: 30 }
                },
                { responsive: true }
            );
            </script>
            


         </body>
        </html>""",total_consumption=TOTAL_CONSUMPTION,
        consumption_percent=CONSUMPTION_PERCENT,
        prediction=prediction,energy_values=energy_values,
        labels=labels,corr_data=corr_data,
        corr_labels=corr_labels,
        )


# DATA ANALYSIS PAGE
@app.route("/learning")
def learning():

    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EnergyFlow - Smart Energy Solutions</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
    
        :root {
          --background: #ffffff;
          --foreground: #0f1419;
          --primary: #1a1d24;
          --primary-foreground: #f8f9fa;
          --secondary: #f4f5f7;
          --muted: #6b7280;
          --accent: #e67e22;
          --dark-surface: #1a1d24;
          --dark-card: #24272e;
          --border: #e5e7eb;
        }
    
        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--foreground);
          background: var(--background);
          line-height: 1.6;
        }
    
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', Georgia, serif;
        }
    
        .heading-display {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
        }
    
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
    
        /* Header */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 24px 0;
        }
    
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
    
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
        }
    
        .logo svg {
          width: 24px;
          height: 24px;
        }
    
        .nav {
          display: none;
          gap: 32px;
        }
    
        @media (min-width: 768px) {
          .nav {
            display: flex;
          }
        }
    
        .nav a {
          color: rgba(248, 249, 250, 0.8);
          text-decoration: none;
          transition: color 0.3s;
        }
    
        .nav a:hover {
          color: var(--primary-foreground);
        }
    
        .btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }
    
        .btn-outline-light {
          background: transparent;
          border: 1px solid rgba(248, 249, 250, 0.5);
          color: var(--primary-foreground);
        }
    
        .btn-outline-light:hover {
          background: var(--primary-foreground);
          color: var(--primary);
        }
    
        .btn-primary {
          background: var(--primary);
          color: var(--primary-foreground);
        }
    
        .btn-primary:hover {
          opacity: 0.9;
        }
    
        .btn-outline-dark {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
        }
    
        .btn-outline-dark:hover {
          background: var(--foreground);
          color: var(--background);
        }
       
        .about-energy {
          background: #0e1117;
          padding: 96px 24px;
        }
        
        .section-title {
          text-align: center;
          color: #ffffff;
          font-size: clamp(32px, 4vw, 48px);
          margin-bottom: 12px;
        }
        
        .section-subtitle {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          max-width: 700px;
          margin: 0 auto 64px;
        }
        
        .energy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        
        .energy-card {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.06),
            rgba(255, 255, 255, 0.02)
          );
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .energy-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        .energy-card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        
        .energy-card h3 {
          color: #ffffff;
          font-size: 18px;
          margin-bottom: 8px;
        }
        
        .energy-card p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.6;
        }


        /* Footer */
        .footer {
          background: var(--background);
          padding: 64px 0;
          border-top: 1px solid var(--border);
        }
    
        .footer-grid {
          display: grid;
          gap: 48px;
        }
    
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
    
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
        }
    
        .footer-logo svg {
          width: 24px;
          height: 24px;
        }
    
        .footer-section p {
          color: var(--muted);
          font-size: 14px;
        }
    
        .footer-section h4 {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          margin-bottom: 16px;
        }
    
        .footer-section ul {
          list-style: none;
        }
    
        .footer-section ul li {
          margin-bottom: 12px;
        }
    
        .footer-section ul a {
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }
    
        .footer-section ul a:hover {
          color: var(--foreground);
        }
    
        .footer-bottom {
          border-top: 1px solid var(--border);
          margin-top: 48px;
          padding-top: 32px;
          text-align: center;
        }
    
        .footer-bottom p {
          color: var(--muted);
          font-size: 14px;
        }
        /* TYPEWRITER TEXT */
        .typewriter {
          color: #ffffff;
          position: relative;
        }
    
        /* BLINKING CURSOR */
        .typewriter::after {
          content: "|";
          margin-left: 4px;
          animation: blink 1s infinite;
          opacity: 0.8;
        }
        
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        
    
      </style>
    </head>
    <body>
    <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="header-inner">
            <a href="#" class="logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              EnergyFlow
            </a>
            
            <nav class="nav">
              <a class="help-btn" href="/">Home</a>
              <a class="help-btn" href="/learning">Learning</a>
              <a class="help-btn" href="/overviews">Overviews</a>
              <a class="help-btn" href="/contact">Contact</a>
            </nav>
            
            <a href="#" class="btn btn-outline-light">Learn More</a>
          </div>
        </div>
      </header>
      <!-- ABOUT PAGE CONTENT -->
     <section class="about">
     <section class="about-energy">
      <div class="container">
        <h2 class="section-title">⚡ Smart Energy Ecosystem</h2>
        <p class="section-subtitle">
          Key technologies and devices that enable efficient, intelligent, and sustainable energy consumption.
        </p>
    
        <div class="energy-grid">
    
          <!-- Card 1 -->
          <div class="energy-card">
            <img src="/static/images/img7.png" alt="Solar Energy">
            <h3>Solar Energy System</h3>
            <p>Converts sunlight into electricity using photovoltaic panels to reduce grid dependency.</p>
          </div>
    
          <!-- Card 2 -->
          <div class="energy-card">
            <img src="/static/images/img8.png" alt="Wind Energy">
            <h3>Wind Energy System</h3>
            <p>Harnesses wind power through turbines to generate renewable energy.</p>
          </div>
    
          <!-- Card 3 -->
          <div class="energy-card">
            <img src="/static/images/img9.png" alt="Home Inverter">
            <h3>Home Inverter & Battery</h3>
            <p>Stores excess energy and provides backup power during outages.</p>
          </div>
    
          <!-- Card 4 -->
          <div class="energy-card">
            <img src="/static/images/img10.png" alt="Smart Meter">
            <h3>Smart Energy Meter</h3>
            <p>Monitors real-time electricity usage and provides detailed insights.</p>
          </div>
    
          <!-- Card 5 -->
          <div class="energy-card">
            <img src="/static/images/img11.png" alt="EV Charging">
            <h3>EV Charging System</h3>
            <p>Charges electric vehicles efficiently using renewable energy.</p>
          </div>
    
          <!-- Card 6 -->
          <div class="energy-card">
            <img src="/static/images/img12.png" alt="Smart Grid">
            <h3>Smart Grid Integration</h3>
            <p>Balances supply and demand using intelligent communication.</p>
          </div>
    
          <!-- Card 7 -->
          <div class="energy-card">
            <img src="/static/images/img13.png" alt="Smart Appliances">
            <h3>Smart Home Appliances</h3>
            <p>Energy-efficient devices that optimize usage automatically.</p>
          </div>
    
          <!-- Card 8 -->
          <div class="energy-card">
            <img src="/static/images/img14.png" alt="Energy Management">
            <h3>Energy Management System</h3>
            <p>Centralized control for analyzing and optimizing energy usage.</p>
          </div>
    
          <!-- Card 9 -->
          <div class="energy-card">
            <img src="/static/images/img15.png" alt="AI Optimization">
            <h3>AI Optimization</h3>
            <p>Uses AI to predict demand and optimize consumption patterns.</p>
          </div>
    
          <!-- Card 10 -->
          <div class="energy-card">
            <img src="/static/images/img16.png" alt="Smart Lighting">
            <h3>Smart Lighting & Thermostats</h3>
            <p>Automatically adjusts lighting and climate for efficiency.</p>
          </div>
    
          <!-- Card 11 -->
          <div class="energy-card">
            <img src="/static/images/img17.png" alt="Industrial Energy">
            <h3>Industrial Energy Monitoring</h3>
            <p>Tracks and manages large-scale industrial energy usage.</p>
          </div>
    
          
    
        </div>
      </div>
    </section>


    <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-section">
              <a href="#" class="footer-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                EnergyFlow
              </a>
              <p>Transforming energy efficiency for a sustainable future.</p>
            </div>
            
            <div class="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/learning">Learning</a></li>
                <li><a href="/overviews">Overviews</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h4>Connect With Us</h4>
              <ul>
                <li><a href="#">LinkedIn</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Instagram</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>© 2026 EnergyFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </body>
      </html>""")


# CONTACT PAGE
import smtplib
from email.message import EmailMessage
YOUR_EMAIL = "rockysaaho755@gmail.com"
EMAIL_PASSWORD = "yfceqvnygwsxkplp"
@app.route("/contact", methods=["GET", "POST"])
def contact():
    success = False

    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        message = request.form["message"]

        msg = EmailMessage()
        msg["Subject"] = "New EnergyFlow Contact Query"
        msg["From"] = YOUR_EMAIL
        msg["To"] = YOUR_EMAIL

        msg.set_content(f"""
    New Contact Form Submission

    Name: {name}
    Email: {email}

    Message:
    {message}
    """)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(YOUR_EMAIL, EMAIL_PASSWORD)
            server.send_message(msg)

        success = True

    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EnergyFlow - Smart Energy Solutions</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
    
        :root {
          --background: #020617;
          --foreground: #f8f9fa;
          --primary: #1a1d24;
          --primary-foreground: #f8f9fa;
          --secondary: #f4f5f7;
          --muted: #6b7280;
          --accent: #e67e22;
          --dark-surface: #1a1d24;
          --dark-card: #24272e;
          --border: #e5e7eb;
        }
    
        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--foreground);
          background: var(--background);
          line-height: 1.6;
          padding-top: 100px;
        }
    
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', Georgia, serif;
        }
    
        .heading-display {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 500;
        }
    
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
    
        /* Header */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 24px 0;
          background: var(--background);
        }
    
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
    
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
        }
    
        .logo svg {
          width: 24px;
          height: 24px;
        }
    
        .nav {
          display: none;
          gap: 32px;
        }
    
        @media (min-width: 768px) {
          .nav {
            display: flex;
          }
        }
    
        .nav a {
          color: rgba(248, 249, 250, 0.8);
          text-decoration: none;
          transition: color 0.3s;
        }
    
        .nav a:hover {
          color: var(--primary-foreground);
        }
    
        .btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }
    
        .btn-outline-light {
          background: transparent;
          border: 1px solid rgba(248, 249, 250, 0.5);
          color: var(--primary-foreground);
        }
    
        .btn-outline-light:hover {
          background: var(--primary-foreground);
          color: var(--primary);
        }
    
        .btn-primary {
          background: var(--primary);
          color: var(--primary-foreground);
        }
    
        .btn-primary:hover {
          opacity: 0.9;
        }
    
        .btn-outline-dark {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
        }
    
        .btn-outline-dark:hover {
          background: var(--foreground);
          color: var(--background);
        }
        /* Footer */
        .footer {
          background: var(--background);
          padding: 64px 0;
          border-top: 1px solid var(--border);
        }
    
        .footer-grid {
          display: grid;
          gap: 48px;
        }
    
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
    
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
        }
    
        .footer-logo svg {
          width: 24px;
          height: 24px;
        }
    
        .footer-section p {
          color: var(--muted);
          font-size: 14px;
        }
    
        .footer-section h4 {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          margin-bottom: 16px;
        }
    
        .footer-section ul {
          list-style: none;
        }
    
        .footer-section ul li {
          margin-bottom: 12px;
        }
    
        .footer-section ul a {
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }
    
        .footer-section ul a:hover {
          color: var(--foreground);
        }
    
        .footer-bottom {
          border-top: 1px solid var(--border);
          margin-top: 48px;
          padding-top: 32px;
          text-align: center;
        }
    
        .footer-bottom p {
          color: var(--muted);
          font-size: 14px;
        }
        /* Contact Section */
        .contact-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
        }
        
        .contact-card {
          width: 100%;
          max-width: 520px;
          background: #1a1d24;
          border-radius: 16px;
          padding: 50px 40px;
          box-shadow: 0 0 40px rgba(0,0,0,0.4);
          border: 1px solid #1e293b;
          text-align: center;
        }
        
        .contact-card h2 {
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .contact-subtext {
          font-size: 14px;
          color: rgba(248,249,250,0.6);
          margin-bottom: 40px;
        }
        
        /* Floating Inputs */
        .input-group {
          position: relative;
          margin-bottom: 30px;
        }
        
        .input-group input,
        .input-group textarea {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid #334155;
          padding: 10px 0;
          color: white;
          font-size: 14px;
          outline: none;
        }
        
        .input-group label {
          position: absolute;
          left: 0;
          top: 10px;
          color: #94a3b8;
          font-size: 13px;
          transition: 0.3s ease;
          pointer-events: none;
        }
        
        .input-group input:focus + label,
        .input-group input:valid + label,
        .input-group textarea:focus + label,
        .input-group textarea:valid + label {
          top: -14px;
          font-size: 11px;
          color: #22c55e;
        }
        
        .input-group input:focus,
        .input-group textarea:focus {
          border-bottom-color: #22c55e;
        }
        
        /* Submit Button */
        .submit-btn {
          margin-top: 20px;
          padding: 12px 30px;
          background: transparent;
          border: 2px solid #22c55e;
          color: #22c55e;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        
        .submit-btn:hover {
          background: #22c55e;
          color: #020617;
        }
        
        .success-msg {
          margin-top: 20px;
          color: #22c55e;
          font-size: 14px;
        }

        </style>
        </head>
        <body>
            <!-- Header -->
            <header class="header">
              <div class="container">
                <div class="header-inner">
                  <a href="#" class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    EnergyFlow
                  </a>
                  
                  <nav class="nav">
                    <a href="/">Home</a>
                    <a href="/learning">Learning</a>
                    <a href="/overviews">Overviews</a>
                    <a href="/contact">Contact</a>
                  </nav>
                  
                  <a href="#" class="btn btn-outline-light">Learn More</a>
                </div>
              </div>
            </header>
            <div class="container contact-wrapper">
              <div class="contact-card">
                <h2>CONTACT US</h2>
                <p class="contact-subtext">
                  Have a question about smart energy consumption?  
                  Drop your query and we’ll get back to you.
                </p>
            
                <form method="POST" action="/contact">
            
                  <div class="input-group">
                    <input type="text" name="name" required>
                    <label>Your Name</label>
                  </div>
            
                  <div class="input-group">
                    <input type="email" name="email" required>
                    <label>Your Email</label>
                  </div>
            
                  <div class="input-group">
                    <textarea name="message" rows="4" required></textarea>
                    <label>Your Message</label>
                  </div>
            
                  <button type="submit" class="submit-btn">
                    SUBMIT →
                  </button>
            
                </form>
            
                {% if success %}
                  <p class="success-msg">✔ Message sent successfully</p>
                {% endif %}
              </div>
            
            </div>

            <!-- Footer -->
            <footer class="footer">
              <div class="container">
                <div class="footer-grid">
                  <div class="footer-section">
                    <a href="#" class="footer-logo">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      EnergyFlow
                    </a>
                    <p>Transforming energy efficiency for a sustainable future.</p>
                  </div>
                  
                  <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                      <li><a href="/">Home</a></li>
                      <li><a href="/learning">Learning</a></li>
                      <li><a href="/overviews">Overviews</a></li>
                      <li><a href="/contact">Contact</a></li>
                    </ul>
                  </div>
                  
                  <div class="footer-section">
                    <h4>Connect With Us</h4>
                    <ul>
                      <li><a href="#">LinkedIn</a></li>
                      <li><a href="#">Twitter</a></li>
                      <li><a href="#">Facebook</a></li>
                      <li><a href="#">Instagram</a></li>
                    </ul>
                  </div>
                  
                  <div class="footer-section">
                    <h4>Legal</h4>
                    <ul>
                      <li><a href="#">Privacy Policy</a></li>
                      <li><a href="#">Terms of Service</a></li>
                      <li><a href="#">Cookie Policy</a></li>
                    </ul>
                  </div>
                </div>
                
                <div class="footer-bottom">
                  <p>© 2026 EnergyFlow. All rights reserved.</p>
                </div>
              </div>
            </footer>
            </body>
        </html>""", success=success)


# RUN APP
if __name__ == "__main__":
    app.run(debug=True)
