/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { isRTL, __, sprintf } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';
import { unlock } from '../../lock-unlock';
import SidebarButton from '../sidebar-button';
import {
	isPreviewingTheme,
	currentlyPreviewingTheme,
} from '../../utils/is-previewing-theme';
import { SidebarNavigationContext } from '../sidebar';

const { useHistory, useLocation } = unlock( routerPrivateApis );

function getBackPath( params ) {
	// Navigation Menus are not currently part of a data view.
	// Therefore when navigating back from a navigation menu
	// the target path is the navigation listing view.
	if ( params.path === '/navigation' && params.postId ) {
		return { path: '/navigation' };
	}

	// From a data view path we navigate back to root
	if ( params.path ) {
		return {};
	}

	// From edit screen for a post we navigate back to post-type specific data view
	if ( params.postType === 'page' ) {
		return { path: '/page', postId: params.postId };
	} else if ( params.postType === 'wp_template' ) {
		return { path: '/wp_template', postId: params.postId };
	} else if ( params.postType === 'wp_navigation' ) {
		return { path: '/navigation', postId: params.postId };
	}

	// Go back to root by default
	return {};
}

export default function SidebarNavigationScreen( {
	isRoot,
	title,
	actions,
	meta,
	content,
	footer,
	description,
	backPath: backPathProp,
} ) {
	const { dashboardLink, dashboardLinkText, previewingThemeName } = useSelect(
		( select ) => {
			const { getSettings } = unlock( select( editSiteStore ) );
			const currentlyPreviewingThemeId = currentlyPreviewingTheme();
			return {
				dashboardLink: getSettings().__experimentalDashboardLink,
				dashboardLinkText:
					getSettings().__experimentalDashboardLinkText,
				// Do not call `getTheme` with null, it will cause a request to
				// the server.
				previewingThemeName: currentlyPreviewingThemeId
					? select( coreStore ).getTheme( currentlyPreviewingThemeId )
							?.name?.rendered
					: undefined,
			};
		},
		[]
	);
	const location = useLocation();
	const history = useHistory();
	const navigate = useContext( SidebarNavigationContext );
	const icon = isRTL() ? chevronRight : chevronLeft;
	return (
		<>
			<VStack
				className={ clsx( 'edit-site-sidebar-navigation-screen__main', {
					'has-footer': !! footer,
				} ) }
				spacing={ 0 }
				justify="flex-start"
			>
				<HStack
					spacing={ 4 }
					alignment="flex-start"
					className="edit-site-sidebar-navigation-screen__title-icon"
				>
					{ ! isRoot && (
						<SidebarButton
							onClick={ () => {
								const backPath =
									backPathProp ??
									location.state?.backPath ??
									getBackPath( location.params );
								history.push( backPath );
								navigate( 'back' );
							} }
							icon={ icon }
							label={ __( 'Back' ) }
							showTooltip={ false }
						/>
					) }
					{ isRoot && (
						<SidebarButton
							icon={ icon }
							label={
								dashboardLinkText || __( 'Go to the Dashboard' )
							}
							href={ dashboardLink || 'index.php' }
						/>
					) }
					<Heading
						className="edit-site-sidebar-navigation-screen__title"
						color={ '#e0e0e0' /* $gray-200 */ }
						level={ 1 }
						size={ 20 }
					>
						{ ! isPreviewingTheme()
							? title
							: sprintf(
									'Previewing %1$s: %2$s',
									previewingThemeName,
									title
							  ) }
					</Heading>
					{ actions && (
						<div className="edit-site-sidebar-navigation-screen__actions">
							{ actions }
						</div>
					) }
				</HStack>
				{ meta && (
					<>
						<div className="edit-site-sidebar-navigation-screen__meta">
							{ meta }
						</div>
					</>
				) }

				<div className="edit-site-sidebar-navigation-screen__content">
					{ description && (
						<p className="edit-site-sidebar-navigation-screen__description">
							{ description }
						</p>
					) }
					{ content }
				</div>
			</VStack>
			{ footer && (
				<footer className="edit-site-sidebar-navigation-screen__footer">
					{ footer }
				</footer>
			) }
		</>
	);
}
