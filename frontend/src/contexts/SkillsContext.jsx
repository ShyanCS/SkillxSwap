import React, { createContext, useContext, useState } from 'react';

const SkillsContext = createContext(undefined);

export const useSkills = () => {
  const context = useContext(SkillsContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  return context;
};

export const SkillsProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const addSkill = async (skillData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/skills/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(skillData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add skill');
      return data;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSkill = async (type) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/skills/get?type=${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cannot get data');
      return data;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSkill = async (skillId, updatedData) => {
    setIsLoading(true);
    try {
      console.log("Updating skill...", skillId, updatedData);

      const res = await fetch(`http://127.0.0.1:5000/api/skills/${skillId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) {
        throw new Error(`Failed to update skill: ${res.status}`);
      }

      const data = await res.json();
      return data;

    } catch (error) {
      console.error("Error updating skill:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSkill = async (skillId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cannot delete data');
      return data;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SkillsContext.Provider
      value={{
        addSkill,
        getSkill,
        updateSkill,
        deleteSkill,
        isLoading,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
}; 