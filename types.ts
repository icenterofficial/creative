
import React from 'react';

export interface GitHubConfig {
  username: string;
  repo: string;
  branch: string;
  token: string; // Personal Access Token
}

export interface Service {
  id: string;
  title: string;
  titleKm: string;
  subtitle: string;
  subtitleKm?: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  description: string;
  descriptionKm?: string;
  features: string[];
  featuresKm?: string[];
  slug?: string;
  _iconString?: string; // Internal use for admin
  image?: string; // Background Image for Hover Effect
}

export interface Project {
  id: string;
  title: string;
  category: string; // Changed from literal union to string to allow dynamic categories
  image: string;
  client?: string;
  slug?: string;
  description?: string; // New field
  link?: string;        // New field
  createdBy?: string;   // New field: Stores ID of the creator
  
  // Case Study Fields
  challenge?: string;
  challengeKm?: string;
  solution?: string;
  solutionKm?: string;
  result?: string;
  resultKm?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleKm: string;
  image: string;
  socials: {
    facebook?: string;
    telegram?: string;
  };
  bio: string;
  bioKm?: string;
  skills: string[];
  experience: string[];
  experienceKm?: string[];
  slug?: string;
  orderIndex?: number; // For sorting
  pinCode?: string;    // For login
}

export interface Job {
  id: string;
  title: string;
  type: string;
  location: string;
  department: string;
  icon: React.ReactNode;
  _iconString?: string; // For Admin input
  link?: string;
  description?: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  date: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  title: string;
  titleKm: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  link: string;
  authorId: string;
  content?: string;
  comments?: Comment[];
  slug?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  contentKm?: string;
  avatar: string;
}

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  titleKm: string;
  description: string;
  descriptionKm?: string;
  icon: React.ReactNode;
}

export interface Partner {
  id: string;
  name: string;
  icon: React.ReactNode;
  image?: string; // New: Logo URL
  _iconString?: string; // Internal use for admin
}

export interface CurrentUser {
    role: 'admin' | 'member';
    id?: string; // Only for members
    name?: string;
}
