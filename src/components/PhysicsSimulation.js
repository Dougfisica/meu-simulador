"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { PlayCircle, StopCircle, RotateCcw } from 'lucide-react';

const PhysicsSimulation = () => {
  // Estados para controlar os parâmetros físicos
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(10);
  const [a, setA] = useState(2);
  const [laps, setLaps] = useState(3);
  
  // Estados para controle da simulação
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [data, setData] = useState([]);
  
  // Referências para animação
  const animationFrameId = useRef(null);
  const startTime = useRef(null);
  
  // Constantes
  const trackLength = 400; // comprimento da pista em metros
  
  // Função para calcular a posição
  const calculatePosition = (t) => {
    let x = x0 + v0 * t + (0.5 * a * t * t);
    return x % trackLength;
  };
  
  // Função para calcular a velocidade
  const calculateVelocity = (t) => {
    return v0 + a * t;
  };
  
  // Função para animar
  const animate = (timestamp) => {
    if (!startTime.current) startTime.current = timestamp;
    const progress = (timestamp - startTime.current) / 1000;
    
    const currentPosition = calculatePosition(progress);
    const currentVelocity = calculateVelocity(progress);
    
    setTime(progress);
    setPosition(currentPosition);
    
    setData(prevData => {
      const newData = [...prevData, {
        time: progress.toFixed(1),
        position: currentPosition.toFixed(1),
        velocity: currentVelocity.toFixed(1)
      }];
      
      if (newData.length > 50) newData.shift();
      return newData;
    });
    
    const totalDistance = x0 + v0 * progress + (0.5 * a * progress * progress);
    if (totalDistance < trackLength * laps) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
    }
  };
  
  // Função para iniciar a simulação
  const startSimulation = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTime.current = null;
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };
  
  // Função para parar a simulação
  const stopSimulation = () => {
    setIsRunning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };
  
  // Função para resetar a simulação
  const resetSimulation = () => {
    stopSimulation();
    setTime(0);
    setPosition(x0);
    setData([]);
  };
  
  // Limpar animação quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  // Calcular posição do carro na pista oval
  const getCarPosition = () => {
    const normalizedPosition = position / trackLength;
    const angle = normalizedPosition * 2 * Math.PI;
    const radius = 150;
    const centerX = 200;
    const centerY = 200;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };
  
  const carPosition = getCarPosition();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna da Esquerda - Controles e Dados */}
        <div className="space-y-6">
          {/* Equação e Parâmetros */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              X = {x0} + {v0}t + ({a}t²)/2
            </h2>
            
            <div className="space-y-6">
              {/* Posição Inicial */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posição Inicial (X₀): {x0} m
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={x0}
                  onChange={(e) => setX0(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Velocidade Inicial */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velocidade Inicial (V₀): {v0} m/s
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={v0}
                  onChange={(e) => setV0(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Aceleração */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aceleração (a): {a} m/s²
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={a}
                  onChange={(e) => setA(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Número de Voltas */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Voltas: {laps}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={laps}
                  onChange={(e) => setLaps(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-4">
            <button
              onClick={startSimulation}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <PlayCircle className="w-5 h-5" />
              Start
            </button>
            
            <button
              onClick={stopSimulation}
              disabled={!isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <StopCircle className="w-5 h-5" />
              Stop
            </button>
            
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>

          {/* Dados em Tempo Real */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <h3 className="font-semibold text-gray-700">Tempo</h3>
              <p className="text-xl">{time.toFixed(1)} s</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-700">Posição</h3>
              <p className="text-xl">{position.toFixed(1)} m</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-700">Velocidade</h3>
              <p className="text-xl">{calculateVelocity(time).toFixed(1)} m/s</p>
            </div>
          </div>
        </div>

        {/* Coluna da Direita - Visualizações */}
        <div className="space-y-6">
          {/* Pista */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="relative w-full aspect-square">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <ellipse
                  cx="200"
                  cy="200"
                  rx="150"
                  ry="150"
                  fill="none"
                  stroke="#333"
                  strokeWidth="20"
                />
                <circle
                  cx={carPosition.x}
                  cy={carPosition.y}
                  r="10"
                  fill="red"
                />
              </svg>
            </div>
          </div>

          {/* Gráficos */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Posição vs Tempo</h3>
              <div className="bg-white p-2 rounded-lg">
                <LineChart width={500} height={200} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="position" 
                    stroke="#8884d8"
                    name="Posição (m)"
                  />
                </LineChart>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Velocidade vs Tempo</h3>
              <div className="bg-white p-2 rounded-lg">
                <LineChart width={500} height={200} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="velocity" 
                    stroke="#82ca9d"
                    name="Velocidade (m/s)"
                  />
                </LineChart>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsSimulation;