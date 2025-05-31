import React, {Dispatch, ReactNode, useReducer} from "react";

/**
 * Helper function that binds an object of action creators to a dispatch function, facilitating the dispatch of actions
 * directly from the action creators without explicitly calling `dispatch`.
 *
 * @template Action - The type of actions that can be dispatched.
 * @template BoundActions - An object where each value is a function returning an action or actions.
 *
 * @param {BoundActions} actions - An object where keys correspond to action names and values
 *                                  are functions that accept the `dispatch` function and return a callable action dispatcher.
 * @param {Dispatch<Action>} dispatch - A dispatch function, typically provided by a Redux store.
 *
 * @returns {{[K in keyof BoundActions]: ReturnType<BoundActions[K]>}} - An object mapping each action creator to its bound dispatcher function.
 */
const bindActions = function <Action, Actions extends Record<string, (dispatch: Dispatch<Action>) => any>>(
	actions: Actions,
	dispatch: Dispatch<Action>
): {
	[K in keyof Actions]: ReturnType<Actions[K]>
} {
	const boundActions = {} as {[K in keyof Actions]: ReturnType<Actions[K]>}

	(Object.keys(actions) as (keyof Actions)[]).forEach((key) => {
		const action = actions[key]
		boundActions[key] = action(dispatch)
	})

	return boundActions
}

/**
 * Factory function to create a context and corresponding provider for state management.
 *
 * @template State - The type of the state managed by the reducer.
 * @template Action - The type of actions dispatched to the reducer.
 * @template BoundActions - The shape of the actions bound to the dispatch function.
 *
 * @param {function(State, Action): State} reducer - Reducer function for state transitions. Takes the current state and an action, and returns the updated state.
 * @param {BoundActions} actions - Object containing action creators that are bound to the dispatch function. Each action creator should return a function that performs an action.
 * @param {State} defaultState - The initial state used by the reducer.
 *
 * @returns {{
 *   Context: React.Context<{ state: State } & { [K in keyof BoundActions]: ReturnType<BoundActions[K]> }>,
 *   Provider: React.FC<{ children: ReactNode }>
 * }} The Context object for accessing state and actions, and the Provider React component for wrapping application components to provide the context.
 */
export default function <State, Action, Actions extends Record<string, (dispatch: Dispatch<Action>) => (...args: any[]) => void >>(
	reducer: (state: State, action: Action) => State,
	actions: Actions,
	defaultState: State
) : {
	Context: React.Context<{ state: State } & { [K in keyof Actions]: ReturnType<Actions[K]>} >
	Provider: React.FC<{ children: ReactNode } >
} {
	const Context = React.createContext<any>(null)

	// Provider is the wrapper element that provides the context to child elements.
	const Provider: React.FC<{children: ReactNode}>= ({children}) => {
		// create a generic reducer for the factory to use
		const [state, dispatch] = useReducer(reducer, defaultState)

		// distribute dispatch to actions.
		const boundActions = bindActions(actions, dispatch)

		return (
			<Context.Provider value={{state, ...boundActions}}>
				{children}
			</Context.Provider>
		)
	}
	return {Context, Provider}
}