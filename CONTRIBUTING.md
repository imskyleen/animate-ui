# Contributing to Animate UI

Thank you for your interest in **contributing to Animate UI**! Your support is highly appreciated, and we look forward to your contributions. This guide will help you understand the project structure and provide detailed instructions for adding a new component to Animate UI.

## Introduction

This repository is a monorepo.

- We use [pnpm](https://pnpm.io) and [workspaces](https://pnpm.io/workspaces) for development.
- We use [Turborepo](https://turbo.build/repo) as our build system.

## Structure

This repository is structured as follows:

```
apps
└── www
    ├── app
    ├── components
    ├── content
    ├── lib
    └── registry
        ├── components
        │   ├── animate (Animate UI Components)
        │   ├── backgrounds
        │   ├── base (Base UI Components)
        │   ├── buttons
        │   ├── community (Community Components)
        │   ├── headless (Headless UI Components)
        │   └── radix (Radix UI Components)
        ├── demo
        │   ├── components
        │   └── primitives
        ├── hooks
        ├── icons
        ├── lib
        └── primitives
            ├── animate (Animate UI Primitives)
            ├── base (Base UI Primitives)
            ├── buttons
            ├── effects
            ├── headless (Headless UI Primitives)
            ├── radix (Radix UI Primitives)
            └── texts
packages
├── eslint-config
├── typescript-config
└── ui (Internal UI components)
```

## Getting Started

### Fork and Clone the Repository

#### 1. Fork the Repository

Click [here](https://github.com/imskyleen/animate-ui/fork) to fork the repository.

#### 2. Clone your Fork to Your Local Machine

```bash
  git clone https://github.com/<YOUR_USERNAME>/animate-ui.git
```

#### 3. Navigate to the Project Directory

```bash
cd animate-ui
```

#### 4. Create a New Branch for Your Changes

```bash
git checkout -b my-branch
```

#### 5. Install Dependencies

```bash
pnpm i
```

#### 6. Run the Project

```bash
pnpm dev
```

## Components

We use the shadcn/ui registry system for developing components. You can find the source code for the components under `apps/www/registry`. The components are organized by categories.

Each component is in a folder organized as follows:

```
my-component
├── index.tsx (the component code)
└── registry-item.json (information for the shadcn registry)
```

### Primitives

Primitives are unstyled components to which we add animations.

When adding or modifying primitive, please ensure that:

1. You have modified or created the associated component.
2. You have modified or created the associated documentation.
3. You have created or modified the demo(s).
4. You run `pnpm registry:build` to update the registry.

### Components

The components use animated primitives (except for certain components such as backgrounds) and are styled with Tailwind.

When adding or modifying a component, please ensure that:

1. You have modified or created the associated primitive.
2. You have modified or created the associated documentation.
3. You have created or modified the demo(s).
4. You run `pnpm registry:build` to update the registry.

### Icons

We exclusively animate icons from [Lucide Icons](https://lucide.dev/icons/).

When adding or modifying an icon, please ensure that:

1. You animated an icon Lucide Icons.
2. You have correctly filled in the same categories as Lucide Icons in the `registry-item.json` file.
3. You run `pnpm registry:build` to update the registry.

**Note: You don't need to create documentation or make a demo for the icons.**

### Registry Item

The registry-item.json file is required to make the component available in the registry.

This is what it should look like:

```json title="my-component/registry-item.json"
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "my-component",
  "type": "registry:ui",
  "title": "My Component",
  "description": "My Component Description",
  "dependencies": [...],
  "registryDependencies": [...],
  "devDependencies": [...],
  "files": [
    {
      "path": "registry/[primitives/components/icons]/[category]/my-component/index.tsx",
      "type": "registry:ui",
      "target": "components/animate-ui/[primitives/components/icons]/[category]/my-component.tsx"
    }
  ]
}
```

[Click here](https://ui.shadcn.com/docs/registry/registry-item-json) to see the `registry-item.json` documentation.

### Demo

A demo is required to make your component visible in the Animate UI documentation.

The demo is structured as a component, but is located in the demo folder.

```
demo
└── [primitives/components]
    └── [category]
        └── my-component
            ├── index.tsx (the demo component code)
            └── registry-item.json (information for the shadcn registry)
```

#### Add a Tweakpane

You can add a Tweakpane allowing users to play with your demo props. Your demo must accept the props you want in your tweakpane.

You must then specify the demo props information in your demo's `registry-item.json` file:

```json title="my-component-demo/registry-item.json"
{
  ...
  "meta": {
    "demoProps": {
      "MyComponent": {
        "props1": { "value": 700, "min": 0, "max": 2000, "step": 100 },
        "props2": { "value": 0 },
        "props3": { "value": "foo" },
        "props4": {
          "value": "center",
          "options": {
            "start": "start",
            "center": "center",
            "end": "end"
          }
        },
        "props5": { "value": true }
      }
    }
  },
 ...
}
```

**You need to run `pnpm registry:build` to see the updated tweakpane in the demo.**

So, how to use `demoProps`?

##### Number

Simple number input:

```json
"myNumber": { "value": 10 }
```

Slider:

```json
"myNumber": { "value": 10, "min": 0, "max": 100, "step": 1 }
```

Select:

```json
"myNumber": {
  "value": 10,
  "options": {
    "Big": 30,
    "Medium": 20,
    "Small": 10
  }
}
```

##### String

Simple text input:

```json
"myString": { "value": "Hello World" }
```

Select:

```json
"myNumber": {
  "value": "small",
  "options": {
    "Big": "big",
    "Medium": "medium",
    "Small": "small"
  }
}
```

##### Boolean

```json
"myBoolean": { "value": true }
```

### Documentation

The documentation is located in the `apps/www/content` folder and follows a structure similar to the registry folder.

```
apps
└── www
    └── content
        ├── components
        │   ├── animate
        │   ├── backgrounds
        │   ├── base
        │   ├── buttons
        │   ├── community
        │   ├── headless
        │   └── radix
        ├── icons
        └── primitives
            ├── animate
            ├── base
            ├── buttons
            ├── effects
            ├── headless
            ├── radix
            └── texts
```

Voici un exemple:

```mdx
---
title: My Component
description: Description for the new component
author:
  name: your name
  url: https://link-to-your-profile.com
releaseDate: 2025-XX-XX
---

<ComponentPreview name="demo-my-component" />

## Installation

<ComponentInstallation name="my-component" />

## Usage

[Basic usage of the component]

## API Reference

### MyComponent

<TypeTable
  type={{
    myProps: {
      description: 'Description for my props',
      type: 'string',
      required: true,
    },
  }}
/>

## Credits

- Credits to [you](https://link-to-your-profile.com) for creating the component
```

## Ask for Help

If you need any assistance or have questions, please feel free to open a [GitHub issue](https://github.com/imskyleen/animate-ui/issues/new). We are here to help!

Thank you again for your contribution to Animate UI! We look forward to seeing your improvements and new components.
