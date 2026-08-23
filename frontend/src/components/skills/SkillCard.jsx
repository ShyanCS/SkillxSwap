import { Clock, Edit3, Trash2, Users } from 'lucide-react';

/**
 * One skill entry in the My Skills grid. Renders offer-specific metadata
 * (proficiency + availability slots + session count) or request-specific
 * metadata (target proficiency + urgency) depending on `type`.
 */
const SkillCard = ({ skill, type, onDelete, onEdit }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              skill.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {skill.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{skill.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {type === 'offer' ? (
            <>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {skill.proficiencyLevel}
              </span>
              {skill.availability?.map((slot) => (
                <span key={slot} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {slot}
                </span>
              ))}
            </>
          ) : (
            <>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                Target: {skill.desiredProficiency}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  skill.urgency === 'High'
                    ? 'bg-red-100 text-red-800'
                    : skill.urgency === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {skill.urgency} Priority
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{skill.matchCount} matches</span>
          </div>
          {type === 'offer' && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{skill.sessionCount} sessions</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(skill)}
          aria-label={`Edit ${skill.name}`}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(skill.id)}
          aria-label={`Delete ${skill.name}`}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default SkillCard;
