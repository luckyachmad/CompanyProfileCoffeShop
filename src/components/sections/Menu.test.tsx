import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for Menu component
 * 
 * Tests verify:
 * - Component structure and data fetching
 * - Proper use of design tokens and styling
 * - Required elements (cards, badges, WhatsApp buttons)
 * - Accessibility attributes
 * 
 * These tests validate the static structure and styling of the components
 * by reading the source code directly, verifying requirements are met.
 */

const menuPath = join(__dirname, 'Menu.tsx');
const menuClientPath = join(__dirname, 'MenuClient.tsx');

describe('Menu Component', () => {
  it('should be a Server Component with async data fetching', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify Server Component structure
    expect(menuContent).toContain('export default async function Menu()');
    expect(menuContent).toContain('await getMenuItems()');
  });

  it('should fetch data with 60-second revalidation', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify revalidation setting per requirement 4.1
    expect(menuContent).toContain('revalidate: 60');
  });

  it('should group items by category', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify grouping logic per requirement 4.1
    expect(menuContent).toContain('groupByCategory');
    expect(menuContent).toContain('category_name');
  });

  it('should render menu item cards with correct styling', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify card styling per requirement 4.2
    expect(menuContent).toContain('rounded-2xl');
    expect(menuContent).toContain('shadow-sm');
    expect(menuContent).toContain('bg-surface');
    expect(menuContent).toContain('border border-border');
    expect(menuContent).toContain('p-6');
  });

  it('should use Next.js Image component with proper attributes', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify image usage per requirement 4.3
    expect(menuContent).toContain('import Image from');
    expect(menuContent).toContain('object-cover');
    expect(menuContent).toContain('alt={item.title}');
  });

  it('should render Best Seller badge conditionally', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify Best Seller badge rendering per requirement 4.4
    expect(menuContent).toContain('item.is_best_seller');
    expect(menuContent).toContain('<Badge>Best Seller</Badge>');
  });

  it('should render WhatsApp button with item title', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify WhatsApp button per requirement 4.5
    expect(menuContent).toContain('<WhatsAppButton');
    expect(menuContent).toContain('variant="inline"');
    expect(menuContent).toContain('itemName={item.title}');
  });

  it('should use MenuClient for animations', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify animation wrapper per requirement 4.6
    expect(menuContent).toContain('import MenuClient from');
    expect(menuContent).toContain('<MenuClient>');
  });

  it('should handle empty state with fallback message', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify empty state handling per requirement 4.7
    expect(menuContent).toContain('menuItems.length === 0');
    expect(menuContent).toContain('Our menu is being updated');
  });

  it('should format prices as currency', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify price formatting per requirement 4.8
    expect(menuContent).toContain('formatPrice');
    expect(menuContent).toContain('Intl.NumberFormat');
  });

  it('should use proper font classes for typography', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify font usage per requirement 1.6
    expect(menuContent).toContain('font-heading');
    expect(menuContent).toContain('font-body');
  });

  it('should have section id for smooth scrolling', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify section id per requirement 1.2
    expect(menuContent).toContain('id="menu"');
  });

  it('should apply minimum section padding', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify section padding per requirement 1.4
    expect(menuContent).toContain('py-20');
    expect(menuContent).toContain('px-4');
  });

  it('should use bg-background for section background', () => {
    const menuContent = readFileSync(menuPath, 'utf-8');
    
    // Verify background token per requirement 1.3
    expect(menuContent).toContain('bg-background');
  });
});

describe('MenuClient Component', () => {
  it('should be a client component with Framer Motion', () => {
    const clientContent = readFileSync(menuClientPath, 'utf-8');
    
    // Verify client component directive
    expect(clientContent).toContain("'use client'");
    expect(clientContent).toContain("import { motion } from 'framer-motion'");
  });

  it('should implement stagger animation with correct timing', () => {
    const clientContent = readFileSync(menuClientPath, 'utf-8');
    
    // Verify stagger animation per requirement 4.6
    expect(clientContent).toContain('staggerChildren: 0.1');
    expect(clientContent).toContain('whileInView');
    expect(clientContent).toContain('viewport={{ once: true }}');
  });

  it('should use correct animation parameters', () => {
    const clientContent = readFileSync(menuClientPath, 'utf-8');
    
    // Verify animation values
    expect(clientContent).toContain('opacity: 0');
    expect(clientContent).toContain('opacity: 1');
    expect(clientContent).toContain('y: 30');
    expect(clientContent).toContain('y: 0');
  });

  it('should use easeOut timing function', () => {
    const clientContent = readFileSync(menuClientPath, 'utf-8');
    
    // Verify timing function
    expect(clientContent).toContain("ease: 'easeOut'");
  });
});
