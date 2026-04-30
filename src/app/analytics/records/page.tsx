"use client";

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function PersonalRecordsPage() {
  const [records, setRecords] = useState<Array<{
    exercise: string;
    weight: number;
    reps: number;
    estimated1RM: number;
    date: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/analysis/personal-records', {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
      } else {
        // 模拟数据
        setRecords([
          {
            exercise: '卧推',
            weight: 85,
            reps: 5,
            estimated1RM: 99.2,
            date: '2026-04-20'
          },
          {
            exercise: '深蹲',
            weight: 120,
            reps: 6,
            estimated1RM: 144,
            date: '2026-04-15'
          },
          {
            exercise: '硬拉',
            weight: 140,
            reps: 4,
            estimated1RM: 163.3,
            date: '2026-04-10'
          },
          {
            exercise: '肩上推举',
            weight: 50,
            reps: 8,
            estimated1RM: 63.3,
            date: '2026-04-05'
          },
          {
            exercise: '引体向上',
            weight: 20,
            reps: 10,
            estimated1RM: 36.7,
            date: '2026-03-30'
          }
        ]);
      }
    } catch (error) {
      logger.error('获取个人记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8">PR 记录</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">个人最佳记录</h2>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">加载中...</div>
          ) : records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">{record.exercise}</div>
                      <div className="text-gray-400">{record.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{record.weight}kg × {record.reps}次</div>
                      <div className="text-emerald-400">1RM: {record.estimated1RM.toFixed(1)}kg</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg mb-2">暂无 PR 记录</div>
                <div className="text-gray-400">完成训练后将自动记录你的最佳表现</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 mb-2">总 PR 数量</div>
            <div className="text-3xl font-bold">{records.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 mb-2">最强动作</div>
            <div className="text-3xl font-bold">
              {records.length > 0 ? 
                records.reduce((max, record) => 
                  record.estimated1RM > max.estimated1RM ? record : max
                ).exercise : 
                '暂无'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
