'use client';

import React from 'react';
import PhysicsSimulation from '@/components/PhysicsSimulation';

export default function PhysicsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Simulação de Movimento Uniformemente Variado
        </h1>
        <PhysicsSimulation />
      </div>
    </main>
  );
}