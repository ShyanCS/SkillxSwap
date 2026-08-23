import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useAvailability } from '../../contexts/AvailabilityContext';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

// "HH:MM" <-> minutes from midnight. 1440 is a valid end (midnight closing the
// day) but not a valid <input type="time"> value, so it renders as 23:59.
export const minutesToTime = (minutes) => {
  const clamped = Math.min(minutes, 1439);
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
};

export const timeToMinutes = (value) => {
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
};

const AvailabilityEditor = () => {
  const { getMyAvailability, saveAvailability } = useAvailability();
  const [timezone, setTimezone] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAvailability();
        setTimezone(data.timezone);
        setSlots(data.slots);
      } catch (err) {
        setError(err.message || 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateSlot = (index, changes) => {
    setSaved(false);
    setSlots((current) => current.map((slot, i) => (i === index ? { ...slot, ...changes } : slot)));
  };

  const addSlot = () => {
    setSaved(false);
    setSlots((current) => [...current, { dayOfWeek: 1, startMinute: 9 * 60, endMinute: 17 * 60 }]);
  };

  const removeSlot = (index) => {
    setSaved(false);
    setSlots((current) => current.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const invalid = slots.find((slot) => slot.endMinute <= slot.startMinute);
    if (invalid) {
      setError('Each window must end after it starts.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await saveAvailability(slots);
      setSlots(data.slots);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading availability...</p>;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Weekly Availability
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            When you&apos;re open to sessions. Times are in your timezone
            {timezone ? ` (${timezone})` : ''}, and partners in other timezones see the equivalent
            hours in theirs.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {slots.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
          <p className="text-gray-500 text-sm">
            No availability set. Partners can currently propose any time.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {slots.map((slot, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-3 border border-gray-200 rounded-lg p-3"
            >
              <select
                value={slot.dayOfWeek}
                onChange={(e) => updateSlot(index, { dayOfWeek: Number(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={minutesToTime(slot.startMinute)}
                onChange={(e) => updateSlot(index, { startMinute: timeToMinutes(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="time"
                value={minutesToTime(slot.endMinute)}
                onChange={(e) => updateSlot(index, { endMinute: timeToMinutes(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="ml-auto p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove this window"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addSlot}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add a window
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save availability'}
        </button>
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </div>
  );
};

export default AvailabilityEditor;
