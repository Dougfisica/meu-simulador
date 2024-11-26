"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { PlayCircle, StopCircle, RotateCcw } from 'lucide-react';

const PhysicsSimulation = () => {
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(10);
  const [a, setA] = useState(2);
  const [laps, setLaps] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [data, setData] = useState([]);
  
  const animationFrameId = useRef(null);
  const startTime = useRef(null);
  const trackLength = 400;
  
  const calculatePosition = (t) => {
    let x = x0 + v0 * t + (0.5 * a * t * t);
    return x % trackLength;
  }
  
  const calculateVelocity = (t) => {
    return v0 + a * t;
  }
  
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
  
  const startSimulation = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTime.current = null;
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };
  
  const stopSimulation = () => {
    setIsRunning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };
  
  const resetSimulation = () => {
    stopSimulation();
    setTime(0);
    setPosition(x0);
    setData([]);
  };
  
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
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
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Coluna da Esquerda - Controles e Equação */}
        <div className="space-y-6">
          {/* Equação e Controles */}
          <Card className="p-6">
            <div className="text-2xl font-bold text-center mb-6">
              X = {x0} + {v0}t + ({a}t²)/2
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Posição Inicial (X₀): {x0} m</label>
                <Slider
                  value={[x0]}
                  onValueChange={(value) => setX0(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              
              <div>
                <label className="block mb-2">Velocidade Inicial (V₀): {v0} m/s</label>
                <Slider
                  value={[v0]}
                  onValueChange={(value) => setV0(value[0])}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
              
              <div>
                <label className="block mb-2">Aceleração (a): {a} m/s²</label>
                <Slider
                  value={[a]}
                  onValueChange={(value) => setA(value[0])}
                  min={-10}
                  max={10}
                  step={0.5}
                />
              </div>
              
              <div>
                <label className="block mb-2">Número de Voltas: {laps}</label>
                <Slider
                  value={[laps]}
                  onValueChange={(value) => setLaps(value[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </div>
          </Card>

          {/* Controles de Simulação */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={startSimulation}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              Start
            </Button>
            
            <Button
              onClick={stopSimulation}
              disabled={!isRunning}
              className="flex items-center gap-2"
            >
              <StopCircle className="w-4 h-4" />
              Stop
            </Button>
            
            <Button
              onClick={resetSimulation}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Informações em Tempo Real */}
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="font-semibold">Tempo</h3>
                <p>{time.toFixed(1)} s</p>
              </div>
              <div>
                <h3 className="font-semibold">Posição</h3>
                <p>{position.toFixed(1)} m</p>
              </div>
              <div>
                <h3 className="font-semibold">Velocidade</h3>
                <p>{calculateVelocity(time).toFixed(1)} m/s</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna da Direita - Pista e Gráficos */}
        <div className="space-y-6">
          {/* Pista e Carro */}
          <Card className="p-6">
            <div className="relative w-400 h-400">
              <svg width="400" height="400">
                <ellipse
                  cx="200"
                  cy="200"
                  rx="150"
                  ry="150"
                  fill="none"
                  stroke="#333"
                  strokeWidth="20"
                />
                {/* Carro */}
                <circle
                  cx={carPosition.x}
                  cy={carPosition.y}
                  r="10"
                  fill="red"
                />
              </svg>
            </div>
          </Card>

          {/* Gráficos */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Posição vs Tempo</h3>
                <LineChart width={400} height={150} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Legend />
                  <Line type="monotone" dataKey="position" stroke="#8884d8" />
                </LineChart>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Velocidade vs Tempo</h3>
                <LineChart width={400} height={150} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Legend />
                  <Line type="monotone" dataKey="velocity" stroke="#82ca9d" />
                </LineChart>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default PhysicsSimulation;