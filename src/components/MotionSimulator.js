"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightCircle, RefreshCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MotionSimulator = () => {
  // Estados
  const [parameters, setParameters] = useState({
    x0: 0,    // posição inicial (m)
    v0: 10,   // velocidade inicial (m/s)
    a: 2,     // aceleração (m/s²)
  });
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [graphData, setGraphData] = useState([]);
  
  // Refs
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Funções de cálculo
  const calculatePosition = (t) => {
    const { x0, v0, a } = parameters;
    return x0 + v0 * t + 0.5 * a * t * t;
  };

  const calculateVelocity = (t) => {
    const { v0, a } = parameters;
    return v0 + a * t;
  };

  // Animação do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha pista
    ctx.beginPath();
    ctx.ellipse(300, 150, 250, 100, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 20;
    ctx.stroke();
    
    // Desenha linha de partida
    ctx.beginPath();
    ctx.moveTo(300, 50);
    ctx.lineTo(300, 250);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Desenha carro
    if (position !== undefined) {
      const trackLength = 1000;
      const angle = ((position % trackLength) / trackLength) * 2 * Math.PI;
      
      const carX = 300 + Math.cos(angle) * 250;
      const carY = 150 + Math.sin(angle) * 100;
      
      ctx.beginPath();
      ctx.arc(carX, carY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }
  }, [position]);

  // Função de animação
  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsedTime = (timestamp - startTimeRef.current) / 1000;
    
    const currentPosition = calculatePosition(elapsedTime);
    const currentVelocity = calculateVelocity(elapsedTime);
    
    setTime(elapsedTime);
    setPosition(currentPosition);
    setVelocity(currentVelocity);
    
    // Atualiza dados do gráfico
    setGraphData(prevData => [...prevData, {
      time: Number(elapsedTime.toFixed(2)),
      position: Number(currentPosition.toFixed(2)),
      velocity: Number(currentVelocity.toFixed(2))
    }]);
    
    if (elapsedTime < 10) { // Limita a simulação a 10 segundos
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
    }
  };

  // Funções de controle
  const startSimulation = () => {
    setIsRunning(true);
    setGraphData([]);
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTime(0);
    setPosition(parameters.x0);
    setVelocity(parameters.v0);
    setGraphData([]);
    startTimeRef.current = null;
  };

  const handleParameterChange = (param, value) => {
    setParameters(prev => ({ ...prev, [param]: Number(value) }));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Simulador de Movimento Uniformemente Variado
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controles */}
          <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block mb-2">
                  Posição Inicial (X₀): {parameters.x0} m
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={parameters.x0}
                  onChange={(e) => handleParameterChange('x0', e.target.value)}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2">
                  Velocidade Inicial (V₀): {parameters.v0} m/s
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={parameters.v0}
                  onChange={(e) => handleParameterChange('v0', e.target.value)}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2">
                  Aceleração (a): {parameters.a} m/s²
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={parameters.a}
                  onChange={(e) => handleParameterChange('a', e.target.value)}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startSimulation}
                disabled={isRunning}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowRightCircle size={20} />
                Iniciar
              </button>
              <button
                onClick={resetSimulation}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <RefreshCcw size={20} />
                Resetar
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Valores Atuais:</h3>
              <p>Tempo: {time.toFixed(2)} s</p>
              <p>Posição: {position.toFixed(2)} m</p>
              <p>Velocidade: {velocity.toFixed(2)} m/s</p>
            </div>
          </div>

          {/* Visualização */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <canvas
                ref={canvasRef}
                width="600"
                height="300"
                className="w-full border border-gray-200 rounded-lg"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    label={{ value: 'Tempo (s)', position: 'bottom' }} 
                  />
                  <YAxis label={{ value: 'Posição (m)', angle: -90, position: 'left' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="position" 
                    stroke="#3b82f6" 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionSimulator;