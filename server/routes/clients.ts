import { Request, Response } from "express";
import { supabaseServer } from "../lib/supabase";

export async function saveClientDraft(req: Request, res: Response) {
  try {
    const { draftId, data, clientId } = req.body as { draftId?: string; data: unknown; clientId?: number };

    if (!data) {
      return res.status(400).json({ message: "Draft 'data' is required" });
    }

    if (draftId) {
      const { data: upd, error } = await supabaseServer
        .from('client_drafts')
        .update({ data, client_id: clientId || null, updated_at: new Date().toISOString() })
        .eq('id', draftId)
        .select('id, updated_at')
        .single();
      if (error) return res.status(500).json({ message: error.message });
      if (!upd) return res.status(404).json({ message: 'Draft not found' });
      return res.json({ message: 'Draft updated', draftId: upd.id, updatedAt: upd.updated_at });
    }

    const { data: ins, error } = await supabaseServer
      .from('client_drafts')
      .insert({ data, client_id: clientId || null })
      .select('id, created_at')
      .single();
    if (error) return res.status(500).json({ message: error.message });
    return res.status(201).json({ message: 'Draft saved', draftId: ins.id, createdAt: ins.created_at });
  } catch (error) {
    console.error("Error saving client draft:", error);
    return res.status(500).json({ message: "Internal server error while saving draft" });
  }
}

export async function getClientDraft(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseServer
      .from('client_drafts')
      .select('id, client_id, data, created_at, updated_at')
      .eq('id', id)
      .single();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: 'Draft not found' });
    return res.json(data);
  } catch (error) {
    console.error("Error fetching client draft:", error);
    return res.status(500).json({ message: "Internal server error while fetching draft" });
  }
}

export async function addClient(req: Request, res: Response) {
  try {
    const {
      // Basic Details
      fullName,
      initials,
      email,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      anniversaryDate,
      
      // Contact Preferences
      preferredContactMethod,
      preferredContactTime,
      communicationFrequency,
      
      // Home Address
      homeAddress,
      homeCity,
      homeState,
      homePincode,
      
      // Work Address
      workAddress,
      workCity,
      workState,
      workPincode,
      
      // Professional Information
      profession,
      sectorOfEmployment,
      designation,
      companyName,
      annualIncome,
      workExperience,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !dateOfBirth) {
      return res.status(400).json({
        message: "Missing required fields: fullName, email, phone, and dateOfBirth are required"
      });
    }

    // Check if client with same email already exists
    const { data: existingClient, error: existErr } = await supabaseServer
      .from('clients')
      .select('id')
      .eq('email', email)
      .limit(1);
    if (existErr) return res.status(500).json({ message: existErr.message });
    if (existingClient && existingClient.length > 0) {
      return res.status(409).json({
        message: "A client with this email address already exists"
      });
    }

    // Generate initials if not provided
    const generatedInitials = initials || fullName.split(' ').map((name: string) => name.charAt(0)).join('.');

    // Set default values for new client
    const tier = "silver";
    const aum = "₹0";
    const aumValue = 0;
    const assignedTo = (req.session as any).userId || 1; // Assign to current user or default to user 1

    // Insert new client
    const { data: inserted, error: insErr } = await supabaseServer
      .from('clients')
      .insert({
        full_name: fullName,
        initials: generatedInitials,
        email,
        phone,
        date_of_birth: dateOfBirth,
        gender: gender || null,
        marital_status: maritalStatus || null,
        anniversary_date: anniversaryDate || null,
        preferred_contact_method: preferredContactMethod || null,
        preferred_contact_time: preferredContactTime || null,
        communication_frequency: communicationFrequency || null,
        home_address: homeAddress || null,
        home_city: homeCity || null,
        home_state: homeState || null,
        home_pincode: homePincode || null,
        work_address: workAddress || null,
        work_city: workCity || null,
        work_state: workState || null,
        work_pincode: workPincode || null,
        profession: profession || null,
        sector_of_employment: sectorOfEmployment || null,
        designation: designation || null,
        company_name: companyName || null,
        annual_income: annualIncome || null,
        work_experience: workExperience ? parseInt(workExperience) : null,
        tier,
        aum,
        aum_value: aumValue,
        assigned_to: assignedTo,
        profile_status: 'incomplete',
        incomplete_sections: ['financial','family','kyc']
      })
      .select('id, full_name, email, tier, aum')
      .single();
    if (insErr) return res.status(500).json({ message: insErr.message });

    res.status(201).json({
      message: "Client added successfully",
      client: {
        id: inserted.id,
        fullName: inserted.full_name,
        email: inserted.email,
        tier: inserted.tier,
        aum: inserted.aum
      }
    });

  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({
      message: "Internal server error while adding client"
    });
  }
}

export async function updateFinancialProfile(req: Request, res: Response) {
  try {
    const clientId = Number(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    console.log("[FinancialProfile] Received request body:", JSON.stringify(req.body, null, 2));

    const {
      annualIncome,
      netWorth,
      riskProfile,
      riskAssessmentScore,
      investmentHorizon,
      investmentObjectives,
      preferredProducts,
      liquidityRequirements,
      taxPlanningPreferences,
      retirementGoals,
      financialInterests,
      // detailed payload (optional persistence later)
      income,
      expenses,
      assets,
      liabilities,
    } = req.body || {};

    console.log("[FinancialProfile] Extracted values:", {
      income: income ? `present (${typeof income})` : 'missing',
      expenses: expenses ? `present (${typeof expenses})` : 'missing',
      assets: assets ? `present (array: ${Array.isArray(assets) ? assets.length : 'not array'})` : 'missing',
      liabilities: liabilities ? `present (array: ${Array.isArray(liabilities) ? liabilities.length : 'not array'})` : 'missing',
    });

    // Persist core fields into clients table
    // Debug: log incoming payload (sanitized) and target client
    console.log("[FinancialProfile] Incoming update", {
      clientId,
      annualIncome,
      netWorth,
      riskProfile,
      riskAssessmentScore,
      investmentHorizon,
      investmentObjectives: Array.isArray(investmentObjectives) ? investmentObjectives.length : typeof investmentObjectives,
      preferredProducts: Array.isArray(preferredProducts) ? preferredProducts.length : typeof preferredProducts,
      liquidityRequirements,
      taxPlanningPreferences,
      retirementGoals,
      financialInterests,
      incomePresent: !!income,
      expensesPresent: !!expenses,
      assetsCount: Array.isArray(assets) ? assets.length : undefined,
      liabilitiesCount: Array.isArray(liabilities) ? liabilities.length : undefined,
    });
    
    // Debug: Log the actual data structures
    console.log("[FinancialProfile] Raw income:", JSON.stringify(income));
    console.log("[FinancialProfile] Raw expenses:", JSON.stringify(expenses));
    console.log("[FinancialProfile] Raw assets:", JSON.stringify(assets));
    console.log("[FinancialProfile] Raw liabilities:", JSON.stringify(liabilities));

    const params = [
      annualIncome ?? null,
      netWorth ?? null,
      riskProfile ?? null,
      typeof riskAssessmentScore === 'number' ? riskAssessmentScore : null,
      investmentHorizon ?? null,
      Array.isArray(investmentObjectives) ? investmentObjectives.join(',') : (investmentObjectives ?? null),
      Array.isArray(preferredProducts) ? preferredProducts.join(',') : (preferredProducts ?? null),
      liquidityRequirements ?? null,
      taxPlanningPreferences ?? null,
      retirementGoals ?? null,
      financialInterests ?? null,
      clientId
    ];

    console.log("[FinancialProfile] SQL params:", params);

    // Snapshot before
    const { data: beforeArr } = await supabaseServer
      .from('clients')
      .select('id, annual_income, net_worth, risk_profile, risk_assessment_score, investment_horizon, investment_objectives, preferred_products, liquidity_requirements, tax_planning_preferences, retirement_goals, financial_interests, income_data, expenses_data, assets_data, liabilities_data')
      .eq('id', clientId)
      .limit(1);

    const updatePayload: Record<string, any> = {
      annual_income: params[0],
      net_worth: params[1],
      risk_profile: params[2],
      risk_assessment_score: params[3],
      investment_horizon: params[4],
      investment_objectives: params[5],
      preferred_products: params[6],
      liquidity_requirements: params[7],
      tax_planning_preferences: params[8],
      retirement_goals: params[9],
      financial_interests: params[10],
    };
    
    // Save detailed financial data as JSONB - Always include if provided
    // Don't check for null/undefined here - we want to save the data as-is
    if (income !== undefined) {
      updatePayload.income_data = income;
    }
    if (expenses !== undefined) {
      updatePayload.expenses_data = expenses;
    }
    if (assets !== undefined) {
      updatePayload.assets_data = assets;
    }
    if (liabilities !== undefined) {
      updatePayload.liabilities_data = liabilities;
    }
    
    console.log("[FinancialProfile] Update payload keys:", Object.keys(updatePayload));
    console.log("[FinancialProfile] Income data present:", !!updatePayload.income_data);
    console.log("[FinancialProfile] Expenses data present:", !!updatePayload.expenses_data);
    console.log("[FinancialProfile] Assets count:", Array.isArray(updatePayload.assets_data) ? updatePayload.assets_data.length : 'not array');
    console.log("[FinancialProfile] Liabilities count:", Array.isArray(updatePayload.liabilities_data) ? updatePayload.liabilities_data.length : 'not array');

    console.log("[FinancialProfile] Final updatePayload before Supabase update:", JSON.stringify(updatePayload, null, 2));
    console.log("[FinancialProfile] Payload keys count:", Object.keys(updatePayload).length);
    console.log("[FinancialProfile] Has income_data key:", 'income_data' in updatePayload);
    console.log("[FinancialProfile] Has expenses_data key:", 'expenses_data' in updatePayload);
    console.log("[FinancialProfile] Has assets_data key:", 'assets_data' in updatePayload);
    console.log("[FinancialProfile] Has liabilities_data key:", 'liabilities_data' in updatePayload);
    
    // Execute the update
    const { data: updateResult, error: updErr } = await supabaseServer
      .from('clients')
      .update(updatePayload)
      .eq('id', clientId)
      .select('id, income_data, expenses_data, assets_data, liabilities_data')
      .single();
    
    if (updErr) {
      console.error("[FinancialProfile] Supabase update error:", updErr);
      console.error("[FinancialProfile] Error details:", JSON.stringify(updErr, null, 2));
      return res.status(500).json({ message: updErr.message, error: updErr });
    }
    
    console.log("[FinancialProfile] Update result from Supabase:", JSON.stringify(updateResult, null, 2));
    
    // If updateResult is null, the update might have succeeded but select failed, or RLS blocked it
    if (!updateResult && !updErr) {
      console.warn("[FinancialProfile] Update returned null result but no error - possible RLS issue or row not found");
      // Try to fetch the row directly to verify it exists
      const { data: verifyRow, error: verifyErr } = await supabaseServer
        .from('clients')
        .select('id, income_data, expenses_data, assets_data, liabilities_data')
        .eq('id', clientId)
        .single();
      
      if (verifyErr) {
        console.error("[FinancialProfile] Verification fetch error:", verifyErr);
      } else {
        console.log("[FinancialProfile] Verification fetch result:", JSON.stringify(verifyRow, null, 2));
      }
    }
    
    if (!updateResult) {
      console.error("[FinancialProfile] No rows updated - updateResult is null");
      return res.status(500).json({ message: "Failed to update financial profile - no rows affected" });
    }

    // Verify the update by fetching the updated record
    const { data: afterArr, error: fetchError } = await supabaseServer
      .from('clients')
      .select('id, annual_income, net_worth, risk_profile, risk_assessment_score, investment_horizon, investment_objectives, preferred_products, liquidity_requirements, tax_planning_preferences, retirement_goals, financial_interests, income_data, expenses_data, assets_data, liabilities_data')
      .eq('id', clientId)
      .single();
    
    if (fetchError) {
      console.error("[FinancialProfile] Error fetching after update:", fetchError);
      return res.status(500).json({ message: "Updated but failed to verify", error: fetchError });
    }

    console.log("[FinancialProfile] Verified after update - income_data:", !!afterArr?.income_data);
    console.log("[FinancialProfile] Verified after update - expenses_data:", !!afterArr?.expenses_data);
    console.log("[FinancialProfile] Verified after update - assets_data:", Array.isArray(afterArr?.assets_data) ? afterArr.assets_data.length : 'not array');
    console.log("[FinancialProfile] Verified after update - liabilities_data:", Array.isArray(afterArr?.liabilities_data) ? afterArr.liabilities_data.length : 'not array');
    
    // Log actual data values for debugging
    console.log("[FinancialProfile] Verified income_data value:", JSON.stringify(afterArr?.income_data));
    console.log("[FinancialProfile] Verified expenses_data value:", JSON.stringify(afterArr?.expenses_data));
    console.log("[FinancialProfile] Verified assets_data value:", JSON.stringify(afterArr?.assets_data));
    console.log("[FinancialProfile] Verified liabilities_data value:", JSON.stringify(afterArr?.liabilities_data));

    res.json({ 
      message: "Financial profile saved", 
      clientId, 
      before: beforeArr?.[0] || null, 
      after: afterArr || null,
      saved: {
        incomeData: !!afterArr?.income_data,
        expensesData: !!afterArr?.expenses_data,
        assetsData: Array.isArray(afterArr?.assets_data) && afterArr.assets_data.length > 0,
        liabilitiesData: Array.isArray(afterArr?.liabilities_data) && afterArr.liabilities_data.length > 0,
      }
    });

  } catch (error) {
    console.error("Error updating financial profile:", error);
    res.status(500).json({
      message: "Internal server error while updating financial profile"
    });
  }
}
