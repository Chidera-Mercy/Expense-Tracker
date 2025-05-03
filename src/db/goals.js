import supabase from "./supabase";

/**
 * Fetch all financial goals for the current user
 * @returns {Promise} Promise object with the fetched goals
 */
export async function fetchGoals(userId) {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching goals:', error.message);
    return { data: null, error };
  }
}

/**
 * Create a new financial goal
 * @param {Object} goalData - Object containing goal data
 * @returns {Promise} Promise object with the created goal
 */
export async function createGoal(goalData, userId) {
  try { 
    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        ...goalData,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating goal:', error.message);
    return { data: null, error };
  }
}

/**
 * Update an existing financial goal
 * @param {string} goalId - ID of the goal to update
 * @param {Object} goalData - Object containing updated goal data
 * @returns {Promise} Promise object with the updated goal
 */
export async function updateGoal(goalId, goalData) {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .update({
        ...goalData,
        updated_at: new Date()
      })
      .eq('id', goalId)
      .select()
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating goal:', error.message);
    return { data: null, error };
  }
}

/**
 * Update the current amount of a financial goal
 * @param {string} goalId - ID of the goal to update
 * @param {number} currentAmount - New current amount
 * @returns {Promise} Promise object with the updated goal
 */
export async function updateGoalProgress(goalId, currentAmount) {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .update({
        current_amount: currentAmount,
        updated_at: new Date()
      })
      .eq('id', goalId)
      .select()
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating goal progress:', error.message);
    return { data: null, error };
  }
}

/**
 * Delete a financial goal
 * @param {string} goalId - ID of the goal to delete
 * @returns {Promise} Promise object with the operation result
 */
export async function deleteGoal(goalId) {
  try {
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId);
      
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting goal:', error.message);
    return { success: false, error };
  }
}

/**
 * Get summary statistics for financial goals
 * @returns {Promise} Promise object with goal statistics
 */
export async function getGoalStats() {
  try {
    const { data: goals, error } = await supabase
      .from('financial_goals')
      .select('*');
      
    if (error) throw error;
    
    // Calculate statistics
    const totalGoals = goals.length;
    const totalTargetAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.target_amount), 0);
    const totalSavedAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.current_amount), 0);
    const totalRemainingAmount = totalTargetAmount - totalSavedAmount;
    
    // Calculate category stats
    const categories = {};
    goals.forEach(goal => {
      if (!categories[goal.category]) {
        categories[goal.category] = {
          count: 0,
          totalAmount: 0
        };
      }
      categories[goal.category].count++;
      categories[goal.category].totalAmount += parseFloat(goal.target_amount);
    });
    
    return {
      data: {
        totalGoals,
        totalTargetAmount,
        totalSavedAmount,
        totalRemainingAmount,
        categories
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching goal stats:', error.message);
    return { data: null, error };
  }
}