import { useEffect, useId, useState } from 'react';
import { useSkills } from '../../contexts/SkillsContext';
import ErrorBanner from '../common/ErrorBanner';
import logger from '../../lib/logger';

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const AVAILABILITY_OPTIONS = DAYS.flatMap((day) => [`${day} AM`, `${day} PM`]);

const EMPTY_FORM = {
  name: '',
  skillId: '',
  description: '',
  proficiencyLevel: 'Intermediate',
  desiredProficiency: 'Intermediate',
  urgency: 'Medium',
  availability: [],
};

function LabeledSelect({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Add/edit form for a user skill, shown as a modal dialog.
 *
 * Owns its own draft state: it starts from `initial` when editing (null
 * means "add"), validates that the typed name is a real catalog entry,
 * and reports save failures inline instead of closing on error. `onSave`
 * receives (userSkillIdOrNull, payload); a rejection keeps the modal open
 * with the error visible, success closes it via onClose().
 */
const SkillFormModal = ({ type, initial = null, onClose, onSave }) => {
  const { listSkill } = useSkills();
  const isEditMode = Boolean(initial);

  const [formData, setFormData] = useState(
    initial
      ? {
          name: initial.name,
          skillId: initial.skillId || '',
          description: initial.description,
          proficiencyLevel: initial.proficiencyLevel || 'Intermediate',
          desiredProficiency: initial.desiredProficiency || 'Intermediate',
          urgency: initial.urgency || 'Medium',
          availability: initial.availability || [],
        }
      : EMPTY_FORM,
  );
  const [skillSearch, setSkillSearch] = useState(initial ? initial.name : '');
  // The catalog only matters while this modal is open, so it is fetched on
  // mount here rather than by the owning page.
  const [catalog, setCatalog] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listSkill()
      .then((data) => {
        if (!cancelled) setCatalog(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setCatalog([]);
          logger.error('Failed to fetch skill catalog:', err);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAvailability = (slot) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter((s) => s !== slot)
        : [...prev.availability, slot],
    }));
  };

  const pickSuggestion = (entry) => {
    setFormData((prev) => ({ ...prev, name: entry.name, skillId: entry.id }));
    setSkillSearch(entry.name);
  };

  const suggestions = catalog.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()),
  );
  const exactMatch = catalog.some((s) => s.name.toLowerCase() === skillSearch.toLowerCase());
  const showSuggestions = skillSearch && !exactMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedSkill = catalog.find((s) => s.name === formData.name);
    if (!selectedSkill) {
      setValidationError('Please select a skill from the suggestions.');
      return;
    }

    const payload = {
      ...formData,
      type,
      status: 'Active',
      matchCount: 0,
      sessionCount: type === 'offer' ? 0 : undefined,
      // The backend resolves/creates the catalog row from this id.
      newSkillId: formData.skillId,
    };

    try {
      await onSave(isEditMode ? initial.id : null, payload);
    } catch (err) {
      logger.error('Failed to save skill:', err);
      setSaveError(err.message || 'Failed to save the skill. Please try again.');
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Skill' : type === 'offer' ? 'Add Skill to Teach' : 'Add Skill to Learn'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ErrorBanner message={validationError} tone="warning" onDismiss={() => setValidationError('')} />
          <ErrorBanner message={saveError} onDismiss={() => setSaveError('')} />

          <div>
            <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 mb-2">
              Skill Name
            </label>
            <input
              id="skill-name"
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type to search skills..."
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="border rounded-lg bg-white mt-1 max-h-40 overflow-y-auto shadow-lg z-10">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="block w-full text-left px-3 py-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => pickSuggestion(s)}
                  >
                    {s.name}
                  </button>
                ))}
                {suggestions.length === 0 && (
                  <div className="px-3 py-2 text-gray-400">No matches found</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="skill-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="skill-description"
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                type === 'offer'
                  ? 'Describe your expertise and what you can teach...'
                  : 'Describe what you want to learn and your goals...'
              }
            />
          </div>

          {type === 'offer' ? (
            <>
              <LabeledSelect
                label="Your Proficiency Level"
                value={formData.proficiencyLevel}
                onChange={(v) => handleInputChange('proficiencyLevel', v)}
                options={PROFICIENCY_LEVELS}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AVAILABILITY_OPTIONS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleAvailability(slot)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.availability.includes(slot)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <LabeledSelect
                label="Desired Proficiency Level"
                value={formData.desiredProficiency}
                onChange={(v) => handleInputChange('desiredProficiency', v)}
                options={PROFICIENCY_LEVELS}
              />
              <LabeledSelect
                label="Urgency"
                value={formData.urgency}
                onChange={(v) => handleInputChange('urgency', v)}
                options={URGENCY_LEVELS}
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                type === 'offer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillFormModal;
