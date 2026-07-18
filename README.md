# AI Comic Drama Platform

An AI-powered web platform for automated comic drama generation.

This platform transforms creative ideas into complete AI-generated comic dramas through an end-to-end workflow, including script generation, character image generation, scene image generation, and comic storyboard generation. It enables creators to efficiently produce high-quality comic content with minimal manual effort.

## Core Features

### 📝 AI Script Generation

Generate complete scripts from simple prompts, story ideas, or creative concepts.

### 👤 AI Character Image Generation

Automatically generate consistent AI character images that remain visually coherent throughout the entire story.

### 🌆 AI Scene Image Generation

Generate high-quality scene illustrations based on the script, narrative context, and visual style.

### 🎬 AI Comic Storyboard Generation

Automatically convert scripts into comic storyboards, including:

* Scene segmentation
* Panel sequencing
* Character placement
* Dialogue allocation
* Shot composition

### 📚 End-to-End AI Comic Drama Workflow

From idea to finished comic drama:

```text
Idea / Prompt
      ↓
AI Script Generation
      ↓
Character Image Generation
      ↓
Scene Image Generation
      ↓
Comic Storyboard Generation
      ↓
AI Comic Drama
```

## Technology Stack

* Frontend: React + TypeScript
* Runtime: Node.js
* AI Model: Gemini API
* Styling: Tailwind CSS

## Run Locally

### Prerequisites

* Node.js
* Gemini API Key

### Installation

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key
```

3. Start the development server

```bash
npm run dev
```

4. Open the local application

```text
http://localhost:5173
```

## Vision

Our vision is to build an end-to-end AI comic drama platform that empowers creators to automatically generate scripts, character images, scene images, and storyboard sequences, making comic drama production faster, more efficient, and more accessible.
